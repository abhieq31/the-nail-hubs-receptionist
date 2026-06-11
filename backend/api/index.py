"""
Vercel serverless entry point — exposes the full booking API from main.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mangum import Mangum

from main import app
from database import init_database

# Serverless invocations skip the uvicorn startup event, so init here
init_database()

handler = Mangum(app)
