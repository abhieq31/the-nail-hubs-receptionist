"""
Test script for AI Agent
Shows how the AI-powered booking conversation works
"""

import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_URL = "http://localhost:8000"
session_id = None


def send_message(message: str):
    """Send a message to the AI agent"""
    global session_id

    payload = {"message": message}
    if session_id:
        payload["session_id"] = session_id

    print(f"\n👤 User: {message}")

    response = requests.post(
        f"{API_URL}/ai-chat",
        json=payload,
        headers={"Content-Type": "application/json"}
    )

    if response.status_code == 200:
        data = response.json()
        session_id = data.get("session_id")
        bot_message = data.get("response", {}).get("message", "")

        print(f"🤖 AI Assistant: {bot_message}")
        return data
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return None


def test_booking_flow():
    """Test a complete booking flow"""

    print("=" * 60)
    print("🧪 Testing AI-Powered Booking Agent")
    print("=" * 60)

    # Check if OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        print("\n⚠️  WARNING: OPENAI_API_KEY not found in environment!")
        print("Please add it to your .env file to test the AI agent.")
        print("\nYou can still test the deterministic agent at /chat endpoint.")
        return

    # Start conversation with natural language
    send_message("Hi, I need to book an appointment for acrylic nails")

    # AI will ask about date/time preferences
    # Let's respond naturally
    input("\n⏸️  Press Enter to continue...")
    send_message("I'd like to come on Monday if possible")

    input("\n⏸️  Press Enter to continue...")
    send_message("11:00 AM works great for me")

    input("\n⏸️  Press Enter to continue...")
    send_message("My name is Sarah")

    input("\n⏸️  Press Enter to continue...")
    send_message("My phone number is 9876543210")

    print("\n" + "=" * 60)
    print("✅ Booking flow completed!")
    print("=" * 60)


def test_natural_language():
    """Test more complex natural language queries"""

    print("\n" + "=" * 60)
    print("🧪 Testing Natural Language Understanding")
    print("=" * 60)

    # Complex request all at once
    send_message("I want to book gel nails for next Tuesday around 2pm, my name is Jessica and phone is 1234567890")

    print("\n" + "=" * 60)
    print("✅ The AI should extract all information and suggest available times!")
    print("=" * 60)


if __name__ == "__main__":
    print("""
    This script demonstrates the AI-powered booking agent.

    Note: You need an OpenAI API key to run this test.
    Add it to backend/.env:

    OPENAI_API_KEY=sk-your-key-here

    Choose a test:
    1. Complete booking flow (guided)
    2. Natural language test (complex query)
    3. Both
    """)

    choice = input("Enter choice (1/2/3): ").strip()

    if choice in ["1", "3"]:
        test_booking_flow()

    if choice in ["2", "3"]:
        test_natural_language()

    print("\n✨ Test completed! Check your database for the booking.\n")
