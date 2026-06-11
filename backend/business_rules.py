"""
Business Rules for The Nail Hubs
Real salon configuration - DO NOT modify without business approval
"""

from datetime import time
from zoneinfo import ZoneInfo

# Business Information
BUSINESS_NAME = "The Nail Hubs"
BUSINESS_TYPE = "Luxury Nail Salon"
LOCATION = "Ankleshwar, Gujarat, India"
ADDRESS = "B-292, Garden City, Ankleshwar – 393001"
PHONE = "07698 235501"
TIMEZONE = ZoneInfo("Asia/Kolkata")

# Operating Hours
WORKING_DAYS = [0, 1, 2, 3, 4, 5, 6]  # All 7 days (0=Monday, 6=Sunday)
CLOSED_DAYS = []  # Open all days
OPENING_TIME = time(11, 0)  # 11:00 AM
CLOSING_TIME = time(18, 0)  # 6:00 PM
BUFFER_MINUTES = 10

# Services (name -> booking duration in minutes, upper end of the real range
# so the schedule never overruns)
SERVICES = {
    "Acrylic Nails": 120,
    "Nail Art": 90,
    "Nail Extensions": 110,
    "Nail Decals": 35,
    "Nail Polish Changes": 30,
    "Nail Painting & Designs": 90,
    "Nail Repair": 30,
}

# Display metadata for the website / chat receptionist
SERVICE_DETAILS = {
    "Acrylic Nails": {"display_duration": "100–120 min", "icon": "💅", "popular": True},
    "Nail Art": {"display_duration": "75–120 min", "icon": "🎨", "popular": False},
    "Nail Extensions": {"display_duration": "90–110 min", "icon": "💎", "popular": False},
    "Nail Decals": {"display_duration": "25–35 min", "icon": "✨", "popular": False},
    "Nail Polish Changes": {"display_duration": "25–30 min", "icon": "💅", "popular": False},
    "Nail Painting & Designs": {"display_duration": "60–90 min", "icon": "🖌️", "popular": False},
    "Nail Repair": {"display_duration": "20–30 min", "icon": "🔧", "popular": False},
}

# Agent Conversation Settings
GREETING_MESSAGE = "Hi ✨ Welcome to The Nail Hubs. Which service would you like to book today?"

AGENT_TONE = {
    "style": "polite, friendly, elegant",
    "message_length": "short",
    "avoid": ["technical jargon", "complex sentences"],
}

# Booking Settings
SLOTS_TO_SUGGEST = 4
ADVANCE_BOOKING_DAYS = 30  # How far ahead customers can book
