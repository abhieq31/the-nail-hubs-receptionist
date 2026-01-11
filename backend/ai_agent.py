"""
AI-Powered Conversational Agent for The Nail Hubs
Uses OpenAI API for natural language understanding and conversation
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from openai import OpenAI

from business_rules import SERVICES, GREETING_MESSAGE, PHONE, BUSINESS_NAME
from availability_engine import get_available_slots, get_next_available_dates, validate_slot_available
from database import create_appointment, get_appointment_by_confirmation_id, cancel_appointment


class AIReceptionistAgent:
    """AI-powered receptionist using OpenAI for natural conversation"""

    def __init__(self, api_key: Optional[str] = None):
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.conversation_history = []
        self.collected_data = {
            "service": None,
            "date": None,
            "time": None,
            "end_time": None,
            "customer_name": None,
            "customer_phone": None,
        }

    def _get_system_prompt(self) -> str:
        """Generate the system prompt for the AI agent"""
        services_list = "\n".join([f"- {name} ({duration} minutes)" for name, duration in SERVICES.items()])

        return f"""You are a polite, friendly, and professional AI receptionist for {BUSINESS_NAME}, a luxury nail salon.

Your goal is to help customers book appointments by collecting the following information:
1. Service type (required)
2. Preferred date (required)
3. Preferred time (required)
4. Customer name (required)
5. Customer phone number (required)

Available services:
{services_list}

Guidelines:
- Be warm, friendly, and use emojis sparingly (✨, 💅, 😊)
- Keep responses short and conversational (1-3 sentences)
- When suggesting times, present 2-4 options clearly
- Never make up availability - always use the provided tool functions
- If a slot is not available, suggest alternatives
- Confirm all details before finalizing the booking
- Provide the confirmation ID after successful booking

Current phone number for questions: {PHONE}

Use the available tools to:
- Check availability for dates
- Get available time slots
- Book appointments
- Handle cancellations and rescheduling
"""

    def _get_available_tools(self) -> List[Dict]:
        """Define tools (functions) available to the AI agent"""
        return [
            {
                "type": "function",
                "function": {
                    "name": "get_next_available_dates",
                    "description": "Get the next available dates for booking",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "days": {
                                "type": "integer",
                                "description": "Number of days to look ahead (default 7)",
                            }
                        },
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "get_available_slots",
                    "description": "Get available time slots for a specific service and date",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "service": {
                                "type": "string",
                                "description": "The service name",
                                "enum": list(SERVICES.keys()),
                            },
                            "requested_date": {
                                "type": "string",
                                "description": "Date in YYYY-MM-DD format",
                            },
                            "count": {
                                "type": "integer",
                                "description": "Number of slots to return (default 4)",
                            },
                        },
                        "required": ["service", "requested_date"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "book_appointment",
                    "description": "Book an appointment after collecting all required information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "customer_name": {"type": "string"},
                            "customer_phone": {"type": "string"},
                            "service": {"type": "string"},
                            "appointment_date": {"type": "string", "description": "YYYY-MM-DD format"},
                            "appointment_time": {"type": "string", "description": "HH:MM:SS format"},
                        },
                        "required": ["customer_name", "customer_phone", "service", "appointment_date", "appointment_time"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "cancel_appointment",
                    "description": "Cancel an existing appointment using confirmation ID",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "confirmation_id": {"type": "string"},
                        },
                        "required": ["confirmation_id"],
                    },
                },
            },
        ]

    def _execute_function(self, function_name: str, arguments: Dict) -> Dict:
        """Execute the requested function and return results"""

        if function_name == "get_next_available_dates":
            days = arguments.get("days", 7)
            dates = get_next_available_dates(days)
            return {"dates": dates}

        elif function_name == "get_available_slots":
            service = arguments["service"]
            requested_date = arguments["requested_date"]
            count = arguments.get("count", 4)

            slots = get_available_slots(service, requested_date, count)

            # Store data
            self.collected_data["service"] = service
            self.collected_data["date"] = requested_date

            return {"slots": slots, "count": len(slots)}

        elif function_name == "book_appointment":
            # Validate slot availability first
            is_available, end_time, error = validate_slot_available(
                service=arguments["service"],
                appointment_date=arguments["appointment_date"],
                appointment_time=arguments["appointment_time"]
            )

            if not is_available:
                return {"success": False, "error": error}

            # Create appointment
            try:
                appointment = create_appointment(
                    customer_name=arguments["customer_name"],
                    customer_phone=arguments["customer_phone"],
                    service=arguments["service"],
                    service_duration=SERVICES[arguments["service"]],
                    appointment_date=arguments["appointment_date"],
                    appointment_time=arguments["appointment_time"],
                    end_time=end_time,
                    source="website"
                )
                return {"success": True, "appointment": appointment}
            except Exception as e:
                return {"success": False, "error": str(e)}

        elif function_name == "cancel_appointment":
            confirmation_id = arguments["confirmation_id"]
            appointment = get_appointment_by_confirmation_id(confirmation_id)

            if not appointment:
                return {"success": False, "error": "Appointment not found"}

            success = cancel_appointment(confirmation_id)
            return {"success": success, "appointment": appointment if success else None}

        return {"error": "Unknown function"}

    def process_message(self, user_message: str, session_id: str = None) -> Dict:
        """
        Process user message using OpenAI and return agent response
        """

        # Add user message to conversation history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # Prepare messages for OpenAI
        messages = [
            {"role": "system", "content": self._get_system_prompt()}
        ] + self.conversation_history

        try:
            # Call OpenAI API
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using cost-effective model
                messages=messages,
                tools=self._get_available_tools(),
                tool_choice="auto",
                temperature=0.7,
            )

            assistant_message = response.choices[0].message

            # Handle tool calls if any
            if assistant_message.tool_calls:
                # Add assistant message with tool calls to history
                self.conversation_history.append({
                    "role": "assistant",
                    "content": assistant_message.content,
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": tc.type,
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments
                            }
                        }
                        for tc in assistant_message.tool_calls
                    ]
                })

                # Execute each tool call
                for tool_call in assistant_message.tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    # Execute function
                    function_result = self._execute_function(function_name, function_args)

                    # Add function result to conversation
                    self.conversation_history.append({
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "name": function_name,
                        "content": json.dumps(function_result)
                    })

                # Get final response from assistant
                final_response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": self._get_system_prompt()}
                    ] + self.conversation_history,
                    temperature=0.7,
                )

                final_message = final_response.choices[0].message.content
                self.conversation_history.append({
                    "role": "assistant",
                    "content": final_message
                })

                return {
                    "message": final_message,
                    "state": "processing",
                }

            else:
                # No tool calls, just return the message
                self.conversation_history.append({
                    "role": "assistant",
                    "content": assistant_message.content
                })

                return {
                    "message": assistant_message.content,
                    "state": "conversation",
                }

        except Exception as e:
            return {
                "message": f"Sorry, something went wrong. Please try again or call us at {PHONE}",
                "state": "error",
                "error": str(e)
            }

    def reset_conversation(self):
        """Reset the conversation history"""
        self.conversation_history = []
        self.collected_data = {
            "service": None,
            "date": None,
            "time": None,
            "end_time": None,
            "customer_name": None,
            "customer_phone": None,
        }
