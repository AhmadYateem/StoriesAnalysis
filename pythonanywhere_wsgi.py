"""
PythonAnywhere WSGI configuration file.

Copy this file's content into:
  /var/www/ahmadandhassan_pythonanywhere_com_wsgi.py

on PythonAnywhere. Adjust the paths if your project directory differs.
"""
import sys
import os

# ── Point to your project directory ──
PROJECT_DIR = '/home/ahmadandhassan/StoriesAnalysis'
BACKEND_DIR = os.path.join(PROJECT_DIR, 'backend')

# Add both to path so imports work
sys.path.insert(0, PROJECT_DIR)
sys.path.insert(0, BACKEND_DIR)

# Set the HuggingFace token as environment variable
os.environ['HF_TOKEN'] = 'PASTE_YOUR_HF_TOKEN_HERE'

# Import the Flask app
from app import app as application  # noqa
