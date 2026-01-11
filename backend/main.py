"""
FastAPI Backend for The Nail Hubs AI Receptionist
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Load environment variables
load_dotenv()

from database import init_database, get_appointment_by_confirmation_id, cancel_appointment, reschedule_appointment
from availability_engine import get_available_slots, get_next_available_dates, validate_slot_available
from agent import NailHubsAgent
from ai_agent import AIReceptionistAgent
from business_rules import SERVICES, BUSINESS_NAME

# Initialize database
init_database()

app = FastAPI(title=f"{BUSINESS_NAME} Booking API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session storage (use Redis in production)
agent_sessions = {}
ai_agent_sessions = {}


# Request/Response Models
class AvailabilityRequest(BaseModel):
    service: str
    date: str
    count: Optional[int] = 4


class BookingRequest(BaseModel):
    customer_name: str
    customer_phone: str
    service: str
    appointment_date: str
    appointment_time: str


class RescheduleRequest(BaseModel):
    confirmation_id: str
    new_date: str
    new_time: str


class CancelRequest(BaseModel):
    confirmation_id: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


# Endpoints
@app.get("/")
def root():
    """API health check"""
    return {
        "status": "online",
        "business": BUSINESS_NAME,
        "message": "AI Receptionist API"
    }


@app.get("/services")
def get_services():
    """Get list of available services"""
    return {
        "services": [
            {"name": name, "duration": duration}
            for name, duration in SERVICES.items()
        ]
    }


@app.get("/available-dates")
def get_available_dates(days: int = 7):
    """Get next available working days"""
    return {
        "dates": get_next_available_dates(days)
    }


@app.post("/availability")
def check_availability(request: AvailabilityRequest):
    """Get available time slots for a service on a specific date"""
    if request.service not in SERVICES:
        raise HTTPException(status_code=400, detail="Invalid service")

    try:
        slots = get_available_slots(
            service=request.service,
            requested_date=request.date,
            count=request.count
        )

        return {
            "service": request.service,
            "date": request.date,
            "slots": slots,
            "count": len(slots)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/book")
def book_appointment(request: BookingRequest):
    """Book a new appointment"""
    if request.service not in SERVICES:
        raise HTTPException(status_code=400, detail="Invalid service")

    # Validate slot availability
    is_available, end_time, error = validate_slot_available(
        service=request.service,
        appointment_date=request.appointment_date,
        appointment_time=request.appointment_time
    )

    if not is_available:
        raise HTTPException(status_code=409, detail=error)

    try:
        from database import create_appointment

        appointment = create_appointment(
            customer_name=request.customer_name,
            customer_phone=request.customer_phone,
            service=request.service,
            service_duration=SERVICES[request.service],
            appointment_date=request.appointment_date,
            appointment_time=request.appointment_time,
            end_time=end_time,
            source="website"
        )

        return {
            "status": "success",
            "appointment": appointment
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reschedule")
def reschedule_booking(request: RescheduleRequest):
    """Reschedule an existing appointment"""
    # Get existing appointment
    appointment = get_appointment_by_confirmation_id(request.confirmation_id)

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if appointment["status"] != "confirmed":
        raise HTTPException(status_code=400, detail="Appointment is not active")

    # Validate new slot
    is_available, end_time, error = validate_slot_available(
        service=appointment["service"],
        appointment_date=request.new_date,
        appointment_time=request.new_time
    )

    if not is_available:
        raise HTTPException(status_code=409, detail=error)

    # Reschedule
    success = reschedule_appointment(
        confirmation_id=request.confirmation_id,
        new_date=request.new_date,
        new_time=request.new_time,
        new_end_time=end_time
    )

    if not success:
        raise HTTPException(status_code=500, detail="Failed to reschedule")

    return {
        "status": "success",
        "message": "Appointment rescheduled",
        "confirmation_id": request.confirmation_id
    }


@app.post("/cancel")
def cancel_booking(request: CancelRequest):
    """Cancel an appointment"""
    appointment = get_appointment_by_confirmation_id(request.confirmation_id)

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    success = cancel_appointment(request.confirmation_id)

    if not success:
        raise HTTPException(status_code=500, detail="Failed to cancel appointment")

    return {
        "status": "success",
        "message": "Appointment cancelled"
    }


@app.get("/appointment/{confirmation_id}")
def get_appointment(confirmation_id: str):
    """Get appointment details by confirmation ID"""
    appointment = get_appointment_by_confirmation_id(confirmation_id)

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return appointment


@app.post("/chat")
def chat(request: ChatRequest):
    """
    Conversational chat endpoint (deterministic state machine)
    Handles natural language booking flow
    """
    session_id = request.session_id or f"session_{datetime.now().timestamp()}"

    # Get or create agent for this session
    if session_id not in agent_sessions:
        agent_sessions[session_id] = NailHubsAgent()

    agent = agent_sessions[session_id]

    # Process message
    response = agent.process_message(request.message, session_id)

    # Clean up completed sessions
    if response.get("state") in ["completed", "error"]:
        if session_id in agent_sessions:
            del agent_sessions[session_id]

    return {
        "session_id": session_id,
        "response": response
    }


@app.post("/ai-chat")
def ai_chat(request: ChatRequest):
    """
    AI-powered conversational chat endpoint
    Uses OpenAI for natural language understanding
    Requires OPENAI_API_KEY environment variable
    """
    session_id = request.session_id or f"ai_session_{datetime.now().timestamp()}"

    # Get or create AI agent for this session
    if session_id not in ai_agent_sessions:
        ai_agent_sessions[session_id] = AIReceptionistAgent()

    agent = ai_agent_sessions[session_id]

    # Process message
    response = agent.process_message(request.message, session_id)

    # Clean up completed/error sessions after some time
    if response.get("state") in ["completed", "error"]:
        # Keep session for a bit in case of follow-up
        pass

    return {
        "session_id": session_id,
        "response": response
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
