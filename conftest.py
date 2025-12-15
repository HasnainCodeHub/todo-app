"""Root pytest configuration.

Sets environment variables BEFORE any other imports to ensure
testing mode is active when config.py loads.
"""
import os
import sys

# MUST be set before any app imports
os.environ["TESTING"] = "1"
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///:memory:"
os.environ["BETTER_AUTH_SECRET"] = "test-secret-key-for-testing-only"

# Add backend to path if not already there
backend_path = os.path.join(os.path.dirname(__file__), "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)
