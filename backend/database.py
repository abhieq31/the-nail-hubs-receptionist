"""
Database setup and models for The Nail Hubs
"""

import sqlite3
import os
from datetime import datetime
from contextlib import contextmanager
from typing import Optional, List, Dict
import secrets

# Use /tmp for Vercel serverless environment (ephemeral storage)
DB_PATH = os.getenv("DB_PATH", "/tmp/nail_hubs.db")


def init_database():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            confirmation_id TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            service TEXT NOT NULL,
            service_duration INTEGER NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            status TEXT DEFAULT 'confirmed',
            source TEXT DEFAULT 'website',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_appointment_date
        ON appointments(appointment_date, appointment_time)
    """)

    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_confirmation_id
        ON appointments(confirmation_id)
    """)

    conn.commit()
    conn.close()


@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


def generate_confirmation_id() -> str:
    """Generate unique 8-character confirmation ID"""
    return f"NH{secrets.token_hex(3).upper()}"


def create_appointment(
    customer_name: str,
    customer_phone: str,
    service: str,
    service_duration: int,
    appointment_date: str,
    appointment_time: str,
    end_time: str,
    source: str = "website"
) -> Dict:
    """Create a new appointment"""
    with get_db() as conn:
        cursor = conn.cursor()
        confirmation_id = generate_confirmation_id()
        now = datetime.now().isoformat()

        cursor.execute("""
            INSERT INTO appointments (
                confirmation_id, customer_name, customer_phone,
                service, service_duration, appointment_date,
                appointment_time, end_time, source, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            confirmation_id, customer_name, customer_phone,
            service, service_duration, appointment_date,
            appointment_time, end_time, source, now, now
        ))

        conn.commit()

        return {
            "confirmation_id": confirmation_id,
            "customer_name": customer_name,
            "customer_phone": customer_phone,
            "service": service,
            "appointment_date": appointment_date,
            "appointment_time": appointment_time,
            "end_time": end_time,
            "status": "confirmed"
        }


def get_appointments_for_date(date: str) -> List[Dict]:
    """Get all confirmed appointments for a specific date"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM appointments
            WHERE appointment_date = ? AND status = 'confirmed'
            ORDER BY appointment_time
        """, (date,))

        return [dict(row) for row in cursor.fetchall()]


def get_appointment_by_confirmation_id(confirmation_id: str) -> Optional[Dict]:
    """Get appointment by confirmation ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM appointments
            WHERE confirmation_id = ?
        """, (confirmation_id,))

        row = cursor.fetchone()
        return dict(row) if row else None


def cancel_appointment(confirmation_id: str) -> bool:
    """Cancel an appointment"""
    with get_db() as conn:
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        cursor.execute("""
            UPDATE appointments
            SET status = 'cancelled', updated_at = ?
            WHERE confirmation_id = ? AND status = 'confirmed'
        """, (now, confirmation_id))

        conn.commit()
        return cursor.rowcount > 0


def reschedule_appointment(
    confirmation_id: str,
    new_date: str,
    new_time: str,
    new_end_time: str
) -> bool:
    """Reschedule an appointment"""
    with get_db() as conn:
        cursor = conn.cursor()
        now = datetime.now().isoformat()

        cursor.execute("""
            UPDATE appointments
            SET appointment_date = ?, appointment_time = ?,
                end_time = ?, updated_at = ?
            WHERE confirmation_id = ? AND status = 'confirmed'
        """, (new_date, new_time, new_end_time, now, confirmation_id))

        conn.commit()
        return cursor.rowcount > 0
