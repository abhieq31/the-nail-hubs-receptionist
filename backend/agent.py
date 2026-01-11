"""
Conversational AI Agent for The Nail Hubs
Polite, friendly, deterministic booking assistant
"""

import re
from datetime import datetime
from typing import Dict, List, Optional
from business_rules import SERVICES, GREETING_MESSAGE, PHONE, BUSINESS_NAME, SLOTS_TO_SUGGEST
from availability_engine import get_available_slots, get_next_available_dates, validate_slot_available
from database import create_appointment, get_appointment_by_confirmation_id, cancel_appointment, reschedule_appointment


class NailHubsAgent:
    """AI Receptionist for The Nail Hubs"""

    def __init__(self):
        self.reset_conversation()

    def reset_conversation(self):
        """Reset conversation state"""
        self.state = "greeting"
        self.service = None
        self.date = None
        self.time = None
        self.end_time = None
        self.customer_name = None
        self.customer_phone = None

    def process_message(self, user_message: str, session_id: str = None) -> Dict:
        """
        Process user message and return agent response
        Returns: {
            "message": str,
            "options": List[str] (optional),
            "state": str,
            "data": Dict (optional)
        }
        """
        message = user_message.strip().lower()

        # Check for cancel/reschedule requests
        if any(word in message for word in ["cancel", "reschedule", "change"]):
            return self.handle_modification_request(message)

        # State machine for conversation flow
        if self.state == "greeting":
            return self.handle_greeting()

        elif self.state == "waiting_for_service":
            return self.handle_service_selection(message)

        elif self.state == "waiting_for_date":
            return self.handle_date_selection(message)

        elif self.state == "waiting_for_time":
            return self.handle_time_selection(message)

        elif self.state == "waiting_for_name":
            return self.handle_name_input(message)

        elif self.state == "waiting_for_phone":
            return self.handle_phone_input(message)

        else:
            return self.handle_greeting()

    def handle_greeting(self) -> Dict:
        """Send greeting message"""
        self.state = "waiting_for_service"
        return {
            "message": GREETING_MESSAGE,
            "options": list(SERVICES.keys()),
            "state": self.state
        }

    def handle_service_selection(self, message: str) -> Dict:
        """Handle service selection"""
        # Try to match service
        selected_service = None
        for service in SERVICES.keys():
            if service.lower() in message or message in service.lower():
                selected_service = service
                break

        if not selected_service:
            return {
                "message": "I didn't quite catch that. Which service would you like?\n\n" + "\n".join([f"• {s}" for s in SERVICES.keys()]),
                "options": list(SERVICES.keys()),
                "state": self.state
            }

        self.service = selected_service
        self.state = "waiting_for_date"

        available_dates = get_next_available_dates(7)
        date_options = [d["formatted"] for d in available_dates]

        return {
            "message": f"Great choice! ✨\n\n{selected_service} takes about {SERVICES[selected_service]} minutes.\n\nWhich day works best for you?",
            "options": date_options,
            "state": self.state,
            "data": {"available_dates": available_dates}
        }

    def handle_date_selection(self, message: str) -> Dict:
        """Handle date selection"""
        # Try to parse date from message
        available_dates = get_next_available_dates(7)

        selected_date = None
        for date_info in available_dates:
            if (date_info["day_name"].lower() in message or
                date_info["formatted"].lower() in message or
                date_info["date"] in message):
                selected_date = date_info["date"]
                break

        if not selected_date:
            return {
                "message": "I didn't catch that date. Please choose from these available days:",
                "options": [d["formatted"] for d in available_dates],
                "state": self.state,
                "data": {"available_dates": available_dates}
            }

        # Get available slots
        slots = get_available_slots(self.service, selected_date, SLOTS_TO_SUGGEST)

        if not slots:
            return {
                "message": "Sorry, no slots available on that day. Would you like to try another date?",
                "options": [d["formatted"] for d in available_dates],
                "state": self.state
            }

        self.date = selected_date
        self.state = "waiting_for_time"

        slot_options = [slot["formatted_time"] for slot in slots]

        return {
            "message": f"Perfect! Here are the available times:\n\nWhich time works for you?",
            "options": slot_options,
            "state": self.state,
            "data": {"slots": slots}
        }

    def handle_time_selection(self, message: str) -> Dict:
        """Handle time slot selection"""
        # Get slots again to find the selected time
        slots = get_available_slots(self.service, self.date, 10)

        selected_slot = None
        for slot in slots:
            if slot["formatted_time"].lower() in message or slot["time"] in message:
                selected_slot = slot
                break

        if not selected_slot:
            return {
                "message": "I didn't catch that time. Please choose from these available slots:",
                "options": [slot["formatted_time"] for slot in slots[:SLOTS_TO_SUGGEST]],
                "state": self.state
            }

        # Validate slot is still available
        is_available, end_time, error = validate_slot_available(
            self.service,
            self.date,
            selected_slot["time"]
        )

        if not is_available:
            return {
                "message": f"Sorry, that slot just got booked! Please choose another time:",
                "options": [slot["formatted_time"] for slot in slots[:SLOTS_TO_SUGGEST]],
                "state": self.state
            }

        self.time = selected_slot["time"]
        self.end_time = end_time
        self.state = "waiting_for_name"

        return {
            "message": "Wonderful! May I have your name please?",
            "state": self.state
        }

    def handle_name_input(self, message: str) -> Dict:
        """Handle customer name input"""
        # Extract name (basic validation)
        name = message.strip().title()

        if len(name) < 2 or len(name) > 50:
            return {
                "message": "Could you please share your full name?",
                "state": self.state
            }

        self.customer_name = name
        self.state = "waiting_for_phone"

        return {
            "message": f"Thank you, {name}! 😊\n\nAnd your phone number?",
            "state": self.state
        }

    def handle_phone_input(self, message: str) -> Dict:
        """Handle phone number input and create booking"""
        # Extract phone number
        phone = re.sub(r'[^\d+]', '', message)

        if len(phone) < 10:
            return {
                "message": "Please provide a valid 10-digit phone number.",
                "state": self.state
            }

        self.customer_phone = phone

        # Create the appointment
        try:
            appointment = create_appointment(
                customer_name=self.customer_name,
                customer_phone=self.customer_phone,
                service=self.service,
                service_duration=SERVICES[self.service],
                appointment_date=self.date,
                appointment_time=self.time,
                end_time=self.end_time,
                source="website"
            )

            # Format confirmation message
            date_obj = datetime.fromisoformat(self.date)
            formatted_date = date_obj.strftime("%A, %B %d, %Y")
            time_obj = datetime.fromisoformat(f"{self.date}T{self.time}")
            formatted_time = time_obj.strftime("%I:%M %p")

            confirmation_msg = f"""✨ All set! Your appointment is confirmed.

📅 {formatted_date}
⏰ {formatted_time}
💅 {self.service}
👤 {self.customer_name}

Confirmation ID: {appointment['confirmation_id']}

We'll see you at {BUSINESS_NAME}! If you need to reschedule or cancel, just share your confirmation ID.

Questions? Call us at {PHONE}"""

            # Reset for next conversation
            self.reset_conversation()

            return {
                "message": confirmation_msg,
                "state": "completed",
                "data": {"appointment": appointment}
            }

        except Exception as e:
            return {
                "message": f"Sorry, something went wrong. Please call us at {PHONE}",
                "state": "error",
                "data": {"error": str(e)}
            }

    def handle_modification_request(self, message: str) -> Dict:
        """Handle cancel/reschedule requests"""
        # Extract confirmation ID if present
        conf_id_match = re.search(r'NH[A-F0-9]{6}', message.upper())

        if conf_id_match:
            conf_id = conf_id_match.group()
            appointment = get_appointment_by_confirmation_id(conf_id)

            if not appointment:
                return {
                    "message": "I couldn't find that booking. Please check your confirmation ID.",
                    "state": "error"
                }

            if "cancel" in message:
                success = cancel_appointment(conf_id)
                if success:
                    return {
                        "message": f"Your appointment has been cancelled. We hope to see you again soon! 💕",
                        "state": "completed"
                    }

            return {
                "message": f"To reschedule, please call us at {PHONE} with your confirmation ID: {conf_id}",
                "state": "pending"
            }

        return {
            "message": f"To cancel or reschedule, please share your confirmation ID (e.g., NH1A2B3C) or call us at {PHONE}",
            "state": "pending"
        }
