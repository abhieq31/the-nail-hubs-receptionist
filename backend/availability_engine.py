"""
Deterministic Availability Engine for The Nail Hubs
No double bookings, no hallucinations
"""

from datetime import datetime, date, time, timedelta
from typing import List, Dict, Optional
from business_rules import (
    WORKING_DAYS, OPENING_TIME, CLOSING_TIME,
    BUFFER_MINUTES, SERVICES, TIMEZONE, ADVANCE_BOOKING_DAYS
)
from database import get_appointments_for_date


def is_working_day(check_date: date) -> bool:
    """Check if the salon is open on this day"""
    return check_date.weekday() in WORKING_DAYS


def get_available_slots(
    service: str,
    requested_date: str,
    count: int = 4
) -> List[Dict]:
    """
    Get available time slots for a service on a specific date
    Returns list of {time, formatted_time} dicts
    """
    if service not in SERVICES:
        return []

    service_duration = SERVICES[service]
    check_date = datetime.fromisoformat(requested_date).date()

    # Check if date is valid
    if not is_working_day(check_date):
        return []

    # Check if date is within booking window
    today = datetime.now(TIMEZONE).date()
    if check_date < today or check_date > today + timedelta(days=ADVANCE_BOOKING_DAYS):
        return []

    # Get existing appointments for this date
    existing_appointments = get_appointments_for_date(requested_date)
    booked_slots = []

    for apt in existing_appointments:
        start = datetime.fromisoformat(f"{apt['appointment_date']}T{apt['appointment_time']}")
        end = datetime.fromisoformat(f"{apt['appointment_date']}T{apt['end_time']}")
        booked_slots.append((start.time(), end.time()))

    # Generate potential slots
    available_slots = []
    current_time = datetime.combine(check_date, OPENING_TIME)
    closing_datetime = datetime.combine(check_date, CLOSING_TIME)

    while current_time < closing_datetime:
        slot_start_time = current_time.time()
        slot_end = current_time + timedelta(minutes=service_duration)
        slot_end_time = slot_end.time()

        # Check if appointment would finish before closing
        if slot_end > closing_datetime:
            break

        # Check for conflicts with existing bookings
        is_available = True
        for booked_start, booked_end in booked_slots:
            if times_overlap(slot_start_time, slot_end_time, booked_start, booked_end):
                is_available = False
                break

        if is_available:
            available_slots.append({
                "time": slot_start_time.isoformat(),
                "formatted_time": format_time_12hr(slot_start_time),
                "end_time": slot_end_time.isoformat()
            })

        # Move to next slot (service duration + buffer)
        current_time += timedelta(minutes=service_duration + BUFFER_MINUTES)

        if len(available_slots) >= count:
            break

    return available_slots


def times_overlap(
    start1: time,
    end1: time,
    start2: time,
    end2: time
) -> bool:
    """Check if two time ranges overlap"""
    return start1 < end2 and end1 > start2


def format_time_12hr(t: time) -> str:
    """Format time in 12-hour format"""
    hour = t.hour
    minute = t.minute
    period = "AM" if hour < 12 else "PM"

    if hour == 0:
        hour = 12
    elif hour > 12:
        hour -= 12

    return f"{hour}:{minute:02d} {period}"


def validate_slot_available(
    service: str,
    appointment_date: str,
    appointment_time: str
) -> tuple[bool, Optional[str], Optional[str]]:
    """
    Validate if a specific slot is still available
    Returns (is_available, end_time, error_message)
    """
    if service not in SERVICES:
        return False, None, "Invalid service"

    service_duration = SERVICES[service]
    check_date = datetime.fromisoformat(appointment_date).date()

    if not is_working_day(check_date):
        return False, None, "Salon is closed on this day"

    # Parse the requested time
    try:
        start_time = datetime.fromisoformat(f"{appointment_date}T{appointment_time}").time()
    except ValueError:
        return False, None, "Invalid time format"

    # Calculate end time
    start_datetime = datetime.combine(check_date, start_time)
    end_datetime = start_datetime + timedelta(minutes=service_duration)
    end_time = end_datetime.time()

    # Check business hours
    if start_time < OPENING_TIME or end_time > CLOSING_TIME:
        return False, None, "Time outside business hours"

    # Check for conflicts
    existing_appointments = get_appointments_for_date(appointment_date)

    for apt in existing_appointments:
        booked_start = datetime.fromisoformat(f"{apt['appointment_date']}T{apt['appointment_time']}").time()
        booked_end = datetime.fromisoformat(f"{apt['appointment_date']}T{apt['end_time']}").time()

        if times_overlap(start_time, end_time, booked_start, booked_end):
            return False, None, "This time slot is no longer available"

    return True, end_time.isoformat(), None


def get_next_available_dates(days_count: int = 7) -> List[Dict]:
    """Get next available working days"""
    available_dates = []
    current_date = datetime.now(TIMEZONE).date()

    days_checked = 0
    while len(available_dates) < days_count and days_checked < ADVANCE_BOOKING_DAYS:
        if is_working_day(current_date):
            available_dates.append({
                "date": current_date.isoformat(),
                "formatted": current_date.strftime("%A, %B %d"),
                "day_name": current_date.strftime("%A")
            })
        current_date += timedelta(days=1)
        days_checked += 1

    return available_dates
