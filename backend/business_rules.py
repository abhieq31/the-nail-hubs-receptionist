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
WORKING_DAYS = [0, 1, 2, 3, 4, 5]  # Monday to Saturday (0=Monday, 6=Sunday)
CLOSED_DAYS = [6]  # Sunday
OPENING_TIME = time(11, 0)  # 11:00 AM
CLOSING_TIME = time(18, 0)  # 6:00 PM
BUFFER_MINUTES = 10

# Services (name -> duration in minutes)
SERVICES = {
    "Gel Nails": 60,
    "Acrylic Nails": 90,
    "Nail Extensions": 90,
    "Bridal Nail Art": 120,
    "Nail Refill": 45,
    "Press-on Nails": 30,
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
