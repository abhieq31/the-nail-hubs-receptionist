# Quick Start Guide - The Nail Hubs Booking System

## Problem: "cd: no such file or directory: backend"

You're already IN the backend directory! Don't run `cd backend` again.

## ✅ Correct Way to Run Tests

### If you're in the backend directory:
```bash
python3 test_ai_agent.py
```

### If you're in the project root:
```bash
cd backend
python3 test_ai_agent.py
```

### How to check where you are:
```bash
pwd
```

If it shows `/Users/abhipatel/the-nail-hubs-receptionist/backend`, you're already in backend!

## 🔧 Fix the 500 Error

The AI agent needs the OpenAI API key. The backend server wasn't restarted after you created the .env file.

### ✅ Backend Server Has Been Restarted
The server is now running with your API key loaded.

### Test Again:
```bash
# Make sure you're in backend directory
cd /Users/abhipatel/the-nail-hubs-receptionist/backend

# Run the test
python3 test_ai_agent.py
```

Choose option 2 for natural language test.

## 📊 What Each Component Does

### Deterministic Agent (/chat endpoint)
- Fast, free, button-based flow
- Currently used by your website
- No AI, just state machine
- Perfect for simple bookings

### AI Agent (/ai-chat endpoint)
- Understands natural language
- Extracts info from complex requests
- Uses OpenAI GPT-4o-mini
- Costs ~$0.0015 per booking
- Better for complex queries

## 🎯 Quick Commands

### Check if servers are running:
```bash
# Backend
curl http://localhost:8000/

# Frontend
curl http://localhost:3001/
```

### View your bookings:
```bash
cd backend
sqlite3 nail_hubs.db "SELECT * FROM appointments;"
```

### Restart backend if needed:
```bash
lsof -ti:8000 | xargs kill -9
cd backend
python3 -m uvicorn main:app --reload --port 8000
```

## ✨ Your System is Ready!

- Frontend: http://localhost:3001
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
