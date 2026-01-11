# The Nail Hubs - AI Receptionist System

A production-ready 24×7 AI receptionist for The Nail Hubs luxury nail salon. This system replaces manual appointment booking through Instagram DMs and phone calls with an intelligent, conversational booking assistant.

## Business Information

**The Nail Hubs**
- Location: B-292, Garden City, Ankleshwar – 393001, Gujarat, India
- Phone: 07698 235501
- Hours: Monday-Saturday, 11:00 AM - 6:00 PM
- Closed: Sunday
- Timezone: Asia/Kolkata

## Features

### Current (MVP)
- 24×7 conversational appointment booking
- Deterministic availability engine (no double bookings)
- Real-time slot validation
- Confirmation ID generation
- Service-aware scheduling (different durations per service)
- Business hours enforcement
- 10-minute buffer between appointments
- Website chat widget integration
- Book, reschedule, and cancel appointments
- SQLite database storage

### Services Offered
- Gel Nails (60 min)
- Acrylic Nails (90 min)
- Nail Extensions (90 min)
- Bridal Nail Art (120 min)
- Nail Refill (45 min)
- Press-on Nails (30 min)

### Planned Features
- Instagram DM integration
- WhatsApp booking
- Google Calendar synchronization
- Multi-staff scheduling
- Admin dashboard
- SMS/Email confirmations
- Customer history tracking

## Project Structure

```
the-nail-hubs-receptionist/
├── backend/
│   ├── main.py                  # FastAPI server
│   ├── agent.py                 # Conversational AI logic
│   ├── availability_engine.py   # Slot calculation engine
│   ├── database.py              # SQLite operations
│   ├── business_rules.py        # Salon configuration
│   ├── requirements.txt         # Python dependencies
│   └── nail_hubs.db            # Database (created on first run)
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWidget.js   # Chat interface
│   │   │   └── ChatWidget.css
│   │   ├── App.js              # Main application
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend folder:
```bash
cd the-nail-hubs-receptionist/backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Start the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd the-nail-hubs-receptionist/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will open in your browser at `http://localhost:3000`

## API Endpoints

### Chat Endpoint (Recommended)
- `POST /chat` - Conversational booking interface

### Direct Endpoints
- `GET /` - Health check
- `GET /services` - List available services
- `GET /available-dates` - Get next available working days
- `POST /availability` - Check available slots for a service/date
- `POST /book` - Create a new appointment
- `POST /reschedule` - Reschedule existing appointment
- `POST /cancel` - Cancel appointment
- `GET /appointment/{confirmation_id}` - Get appointment details

## Usage Examples

### Chat-Based Booking (Recommended)

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hi"}'
```

The agent will guide customers through:
1. Service selection
2. Date preference
3. Time slot selection
4. Name and phone collection
5. Booking confirmation

### Direct Booking

```bash
# Check availability
curl -X POST http://localhost:8000/availability \
  -H "Content-Type: application/json" \
  -d '{
    "service": "Gel Nails",
    "date": "2026-01-15",
    "count": 4
  }'

# Book appointment
curl -X POST http://localhost:8000/book \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Priya Shah",
    "customer_phone": "9876543210",
    "service": "Gel Nails",
    "appointment_date": "2026-01-15",
    "appointment_time": "14:00:00"
  }'
```

## Agent Conversation Flow

1. **Greeting**
   - "Hi ✨ Welcome to The Nail Hubs. Which service would you like to book today?"

2. **Service Selection**
   - Shows list of services with durations

3. **Date Selection**
   - Shows next 7 available working days

4. **Time Selection**
   - Shows 4 available slots based on service duration

5. **Contact Information**
   - Collects name and phone number

6. **Confirmation**
   - Creates booking and returns confirmation ID (e.g., NH1A2B3C)

## Business Rules

All business logic is centralized in `backend/business_rules.py`:

- **Working Days**: Monday-Saturday (closed Sunday)
- **Hours**: 11:00 AM - 6:00 PM
- **Buffer**: 10 minutes between appointments
- **Advance Booking**: Up to 30 days ahead
- **Timezone**: Asia/Kolkata

To modify business rules, update this file and restart the backend.

## Database Schema

### appointments table
- `id` - Auto-increment primary key
- `confirmation_id` - Unique 8-char ID (NH + 6 hex chars)
- `customer_name` - Customer name
- `customer_phone` - Contact number
- `service` - Service name
- `service_duration` - Duration in minutes
- `appointment_date` - Date (ISO format)
- `appointment_time` - Start time (ISO format)
- `end_time` - End time (ISO format)
- `status` - confirmed/cancelled
- `source` - website/instagram/whatsapp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Deployment

### Production Checklist

1. **Backend**
   - Use production ASGI server (Gunicorn + Uvicorn)
   - Set up proper CORS origins
   - Move to PostgreSQL for production
   - Add authentication for admin endpoints
   - Set up logging and monitoring
   - Configure environment variables

2. **Frontend**
   - Build production bundle: `npm run build`
   - Update API_URL to production backend
   - Host on Netlify/Vercel or your domain
   - Enable HTTPS

3. **Database**
   - Migrate from SQLite to PostgreSQL
   - Set up automated backups
   - Add database migrations tool (Alembic)

### Quick Deploy

```bash
# Backend (using Gunicorn)
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

# Frontend
npm run build
# Deploy build/ folder to hosting service
```

## Integration Guide

### Website Integration

Replace your "Book Appointment Now" button with:

```html
<script src="chat-widget.js"></script>
<button onclick="openNailHubsChat()">Book Appointment Now</button>
```

Or embed the React component directly into your website.

### Instagram DM Integration (Future)

1. Set up Instagram Business Account
2. Configure webhook to receive messages
3. Route messages to `/chat` endpoint
4. Same agent handles Instagram conversations

### WhatsApp Integration (Future)

1. Set up WhatsApp Business API
2. Configure webhook
3. Route to `/chat` endpoint with `source: "whatsapp"`

## Customization

### Modifying Services

Edit `backend/business_rules.py`:

```python
SERVICES = {
    "New Service Name": 60,  # duration in minutes
    # ...
}
```

### Changing Business Hours

Edit `backend/business_rules.py`:

```python
OPENING_TIME = time(10, 0)  # 10:00 AM
CLOSING_TIME = time(19, 0)  # 7:00 PM
```

### Customizing Agent Messages

Edit `backend/agent.py` to modify conversation flow and messages.

## Testing

### Test Backend
```bash
cd backend
pytest  # (add tests in tests/ folder)
```

### Test Availability Engine
```bash
python -c "
from availability_engine import get_available_slots
slots = get_available_slots('Gel Nails', '2026-01-15')
print(slots)
"
```

## Troubleshooting

### Backend won't start
- Check if port 8000 is available
- Verify Python version: `python --version`
- Check dependencies: `pip list`

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check CORS settings in `main.py`
- Verify API_URL in `ChatWidget.js`

### No slots showing
- Check business hours configuration
- Verify the date is a working day (not Sunday)
- Check database for conflicting appointments

## Support

For issues or questions:
- Phone: 07698 235501
- Update business logic in `business_rules.py`
- Check logs in backend console

## License

Proprietary - The Nail Hubs

---

**Built specifically for The Nail Hubs, Ankleshwar**

This is not generic SaaS software. This is a custom receptionist replacement tailored to your salon's exact needs.
