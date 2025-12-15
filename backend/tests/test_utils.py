"""
Unit tests for utility functions.
"""
import pytest
from datetime import datetime, timezone
import zoneinfo

from app.utils.datetime_utils import ensure_aware_utc

def test_ensure_aware_utc_with_none():
    """Test that ensure_aware_utc returns None when given None."""
    assert ensure_aware_utc(None) is None

def test_ensure_aware_utc_with_naive_datetime():
    """Test that a naive datetime is made aware in UTC."""
    naive_dt = datetime(2025, 1, 1, 12, 0, 0)
    aware_dt = ensure_aware_utc(naive_dt)
    assert aware_dt.tzinfo is not None
    assert aware_dt.tzinfo == timezone.utc
    assert aware_dt.year == 2025
    assert aware_dt.hour == 12

def test_ensure_aware_utc_with_aware_utc_datetime():
    """Test that an already aware UTC datetime is returned unchanged."""
    aware_utc_dt = datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    result_dt = ensure_aware_utc(aware_utc_dt)
    assert result_dt == aware_utc_dt
    assert result_dt.tzinfo == timezone.utc

def test_ensure_aware_utc_with_aware_other_tz_datetime():
    """Test that an aware datetime in another timezone is converted to UTC."""
    ny_tz = zoneinfo.ZoneInfo("America/New_York")
    # 7 AM in New York on Jan 1, 2025 is 12 PM UTC
    aware_ny_dt = datetime(2025, 1, 1, 7, 0, 0, tzinfo=ny_tz)
    
    result_dt = ensure_aware_utc(aware_ny_dt)
    
    assert result_dt.tzinfo == timezone.utc
    assert result_dt.year == 2025
    assert result_dt.month == 1
    assert result_dt.day == 1
    assert result_dt.hour == 12  # Converted from 7 AM EST to UTC
    assert result_dt.minute == 0
