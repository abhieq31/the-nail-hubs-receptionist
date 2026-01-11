# The Nail Hubs - System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│                  http://localhost:3001                      │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              ChatWidget.jsx                          │  │
│  │                                                      │  │
│  │  • User Interface                                   │  │
│  │  • Message Display                                  │  │
│  │  • Button Options                                   │  │
│  │  • API Communication                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│                          │ HTTP POST                        │
│                          ▼                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                 API ENDPOINTS (FastAPI)                     │
│                http://localhost:8000                        │
│                                                             │
│  ┌─────────────────────┐       ┌──────────────────────┐   │
│  │   POST /chat        │       │  POST /ai-chat       │   │
│  │                     │       │                      │   │
│  │ • Deterministic     │       │ • AI-Powered         │   │
│  │ • State Machine     │       │ • OpenAI GPT-4o      │   │
│  │ • Button Flow       │       │ • Natural Language   │   │
│  │ • Fast & Free       │       │ • Flexible           │   │
│  └──────────┬──────────┘       └──────────┬───────────┘   │
│             │                              │               │
│             ▼                              ▼               │
│  ┌─────────────────────┐       ┌──────────────────────┐   │
│  │   agent.py          │       │   ai_agent.py        │   │
│  │   NailHubsAgent     │       │   AIReceptionistAgent│   │
│  └──────────┬──────────┘       └──────────┬───────────┘   │
│             │                              │               │
│             │                              │               │
│             └──────────────┬───────────────┘               │
│                            │                               │
│                            ▼                               │
│           ┌────────────────────────────────┐               │
│           │     BUSINESS LOGIC LAYER       │               │
│           │                                │               │
│           │  ┌──────────────────────────┐ │               │
│           │  │ availability_engine.py   │ │               │
│           │  │                          │ │               │
│           │  │ • Calculate open slots  │ │               │
│           │  │ • Check availability    │ │               │
│           │  │ • Apply business rules  │ │               │
│           │  └──────────────────────────┘ │               │
│           │                                │               │
│           │  ┌──────────────────────────┐ │               │
│           │  │ business_rules.py        │ │               │
│           │  │                          │ │               │
│           │  │ • Working hours         │ │               │
│           │  │ • Services & duration   │ │               │
│           │  │ • Business settings     │ │               │
│           │  └──────────────────────────┘ │               │
│           │                                │               │
│           │  ┌──────────────────────────┐ │               │
│           │  │ database.py              │ │               │
│           │  │                          │ │               │
│           │  │ • Create appointments   │ │               │
│           │  │ • Query bookings        │ │               │
│           │  │ • Cancel/Reschedule     │ │               │
│           │  └──────────┬───────────────┘ │               │
│           └─────────────┼──────────────────┘               │
│                         │                                  │
└─────────────────────────┼──────────────────────────────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │   SQLite Database   │
               │   nail_hubs.db      │
               │                     │
               │ • appointments      │
               │ • confirmation_ids  │
               │ • customer_info     │
               └─────────────────────┘
```

## Data Flow

### Booking Flow (Deterministic Agent)

```
1. User clicks "Book"
   │
   ▼
2. Frontend sends: POST /chat {"message": "hi"}
   │
   ▼
3. Backend creates session → NailHubsAgent
   │
   ▼
4. Agent state: "greeting" → Returns service options
   │
   ▼
5. User selects "Acrylic Nails"
   │
   ▼
6. Agent state: "waiting_for_date" → Calls availability_engine
   │
   ▼
7. Returns available dates
   │
   ▼
8. User selects date → Agent gets time slots
   │
   ▼
9. User selects time → Agent asks for name
   │
   ▼
10. User enters name → Agent asks for phone
    │
    ▼
11. User enters phone → Agent creates booking
    │
    ▼
12. database.create_appointment() → SQLite
    │
    ▼
13. Returns confirmation ID
    │
    ▼
14. Agent resets, session cleaned up
```

### Booking Flow (AI Agent)

```
1. User: "I need acrylic nails tomorrow at 2pm"
   │
   ▼
2. Frontend: POST /ai-chat {"message": "..."}
   │
   ▼
3. Backend creates: AIReceptionistAgent
   │
   ▼
4. Agent sends to OpenAI with:
   - System prompt (rules, context)
   - User message
   - Available tools (functions)
   │
   ▼
5. OpenAI responds: Use tool get_available_slots()
   │
   ▼
6. Agent executes: availability_engine.get_available_slots()
   │
   ▼
7. Results sent back to OpenAI
   │
   ▼
8. OpenAI generates: "Here are available times: ..."
   │
   ▼
9. User selects time
   │
   ▼
10. AI asks for missing info (name, phone)
    │
    ▼
11. When all info collected: Calls book_appointment()
    │
    ▼
12. Agent executes: database.create_appointment()
    │
    ▼
13. Returns confirmation to user
```

## Component Breakdown

### Frontend Components

```
frontend/
├── src/
│   ├── App.js                    # Main app component
│   ├── components/
│   │   ├── ChatWidget.js         # Main chat interface
│   │   └── ChatWidget.css        # Styling
│   └── index.js                  # Entry point
├── public/
│   └── index.html                # HTML template
└── package.json                  # Dependencies
```

### Backend Structure

```
backend/
├── main.py                       # FastAPI app, endpoints
├── agent.py                      # Deterministic agent
├── ai_agent.py                   # AI-powered agent (NEW)
├── availability_engine.py        # Slot calculation
├── business_rules.py             # Configuration
├── database.py                   # SQLite operations
├── requirements.txt              # Python packages
├── .env.example                  # Environment template
├── .env                          # API keys (create this)
└── nail_hubs.db                  # SQLite database
```

## Technology Stack

### Frontend
- **React** 18.x - UI framework
- **JavaScript** - Programming language
- **CSS** - Styling
- **Fetch API** - HTTP requests

### Backend
- **Python** 3.14 - Programming language
- **FastAPI** 0.115+ - Web framework
- **Pydantic** 2.10+ - Data validation
- **Uvicorn** 0.32+ - ASGI server
- **OpenAI** 1.0+ - AI integration
- **SQLite** - Database (built-in)
- **python-dateutil** - Date handling
- **python-dotenv** - Environment config

## API Endpoints

### Core Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/` | GET | Health check | No |
| `/services` | GET | List services | No |
| `/available-dates` | GET | Get open dates | No |
| `/availability` | POST | Check time slots | No |
| `/book` | POST | Create booking | No |
| `/reschedule` | POST | Update booking | No |
| `/cancel` | POST | Cancel booking | No |
| `/appointment/{id}` | GET | Get booking details | No |
| `/chat` | POST | Deterministic agent | No |
| `/ai-chat` | POST | AI agent | API Key |

### Request/Response Examples

**POST /chat**
```json
Request:
{
  "message": "Acrylic Nails",
  "session_id": "session_123" // optional
}

Response:
{
  "session_id": "session_123",
  "response": {
    "message": "Great choice! Which day works for you?",
    "options": ["Monday, Jan 12", "Tuesday, Jan 13"],
    "state": "waiting_for_date"
  }
}
```

**POST /ai-chat**
```json
Request:
{
  "message": "I want acrylic nails tomorrow afternoon",
  "session_id": "ai_session_456" // optional
}

Response:
{
  "session_id": "ai_session_456",
  "response": {
    "message": "I found these afternoon slots for acrylic nails tomorrow:\n1. 2:20 PM\n2. 4:00 PM\n\nWhich works best?",
    "state": "processing"
  }
}
```

## Database Schema

```sql
CREATE TABLE appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  confirmation_id TEXT UNIQUE NOT NULL,    -- e.g., "NH3F2A1B"
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service TEXT NOT NULL,                   -- e.g., "Acrylic Nails"
  service_duration INTEGER NOT NULL,       -- minutes
  appointment_date TEXT NOT NULL,          -- YYYY-MM-DD
  appointment_time TEXT NOT NULL,          -- HH:MM:SS
  end_time TEXT NOT NULL,                  -- HH:MM:SS
  status TEXT DEFAULT 'confirmed',         -- confirmed|cancelled
  source TEXT DEFAULT 'website',           -- website|phone|walk-in
  created_at TEXT NOT NULL,                -- ISO timestamp
  updated_at TEXT NOT NULL                 -- ISO timestamp
);

-- Indexes for performance
CREATE INDEX idx_appointment_date ON appointments(appointment_date, appointment_time);
CREATE INDEX idx_confirmation_id ON appointments(confirmation_id);
```

## Environment Variables

```bash
# Required for AI Agent
OPENAI_API_KEY=sk-...

# Optional (defaults shown)
PORT=8000
DATABASE_PATH=nail_hubs.db
```

## Deployment Architecture

### Development (Current)
```
localhost:3001 (Frontend) → localhost:8000 (Backend) → SQLite (Local)
```

### Production (Recommended)
```
CDN/Netlify (Frontend) → Cloud Server/Heroku (Backend) → PostgreSQL
                              ↓
                         OpenAI API
```

## Security Considerations

1. **CORS** - Currently allows all origins (`*`)
   - Production: Restrict to your domain

2. **API Key** - Stored in `.env`
   - Production: Use secret management service

3. **Rate Limiting** - None currently
   - Production: Add rate limiting middleware

4. **Input Validation** - Handled by Pydantic
   - ✅ Already secure

5. **SQL Injection** - Using parameterized queries
   - ✅ Already secure

## Performance

### Response Times

| Operation | Deterministic | AI Agent |
|-----------|--------------|----------|
| Initial greeting | <50ms | 1-2s |
| Check availability | <100ms | 1-2s |
| Book appointment | <100ms | 2-3s |
| Total booking | <1s | 5-10s |

### Scalability

- **Current:** Single process, SQLite
- **Handles:** ~100 concurrent users
- **Upgrade path:** PostgreSQL + Redis + Load balancer

## Monitoring & Logging

### Current Logging
- Uvicorn access logs
- FastAPI auto-generated docs at `/docs`
- No structured logging yet

### Recommended for Production
- Structured logging (JSON format)
- Error tracking (Sentry)
- Usage analytics
- OpenAI API cost tracking
- Database query monitoring

---

This architecture provides a solid foundation for a booking system with both traditional and AI-powered conversation interfaces.
