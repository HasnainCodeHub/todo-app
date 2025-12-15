"""
Tests for datetime utilities.

Covers:
- ensure_aware_utc function
- Naive datetime handling
- Timezone conversion
- None handling
"""

import pytest
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo


class TestEnsureAwareUtc:
    """Tests for the ensure_aware_utc utility function."""

    def test_none_input_returns_none(self):
        """Test that None input returns None."""
        from app.utils.datetime_utils import ensure_aware_utc

        result = ensure_aware_utc(None)
        assert result is None

    def test_naive_datetime_becomes_utc(self):
        """Test that naive datetime is interpreted as UTC."""
        from app.utils.datetime_utils import ensure_aware_utc

        naive = datetime(2025, 1, 15, 10, 30, 0)
        result = ensure_aware_utc(naive)

        assert result is not None
        assert result.tzinfo is not None
        assert result.tzinfo == timezone.utc
        # Value should be unchanged (assumed UTC)
        assert result.year == 2025
        assert result.month == 1
        assert result.day == 15
        assert result.hour == 10
        assert result.minute == 30

    def test_utc_aware_datetime_unchanged(self):
        """Test that UTC-aware datetime passes through unchanged."""
        from app.utils.datetime_utils import ensure_aware_utc

        utc_aware = datetime(2025, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
        result = ensure_aware_utc(utc_aware)

        assert result == utc_aware
        assert result.tzinfo == timezone.utc

    def test_non_utc_aware_converted_to_utc(self):
        """Test that non-UTC aware datetime is converted to UTC."""
        from app.utils.datetime_utils import ensure_aware_utc

        # Create datetime in EST (UTC-5)
        est = ZoneInfo("America/New_York")
        est_time = datetime(2025, 1, 15, 10, 0, 0, tzinfo=est)

        result = ensure_aware_utc(est_time)

        assert result is not None
        assert result.tzinfo == timezone.utc
        # EST is UTC-5, so 10:00 EST = 15:00 UTC
        assert result.hour == 15

    def test_positive_offset_converted_to_utc(self):
        """Test that positive offset timezone is converted correctly."""
        from app.utils.datetime_utils import ensure_aware_utc

        # Create datetime in UTC+5 (e.g., PKT)
        pkt = ZoneInfo("Asia/Karachi")
        pkt_time = datetime(2025, 1, 15, 15, 0, 0, tzinfo=pkt)

        result = ensure_aware_utc(pkt_time)

        assert result is not None
        assert result.tzinfo == timezone.utc
        # PKT is UTC+5, so 15:00 PKT = 10:00 UTC
        assert result.hour == 10

    def test_preserves_microseconds(self):
        """Test that microseconds are preserved."""
        from app.utils.datetime_utils import ensure_aware_utc

        dt = datetime(2025, 1, 15, 10, 30, 45, 123456, tzinfo=timezone.utc)
        result = ensure_aware_utc(dt)

        assert result.microsecond == 123456

    def test_string_iso_format_raises_type_error(self):
        """Test that string input raises TypeError (not a datetime)."""
        from app.utils.datetime_utils import ensure_aware_utc

        with pytest.raises((TypeError, AttributeError)):
            ensure_aware_utc("2025-01-15T10:30:00Z")  # type: ignore


class TestDatetimeEdgeCases:
    """Edge case tests for datetime handling."""

    def test_datetime_at_midnight(self):
        """Test handling of midnight datetime."""
        from app.utils.datetime_utils import ensure_aware_utc

        midnight = datetime(2025, 1, 15, 0, 0, 0)
        result = ensure_aware_utc(midnight)

        assert result is not None
        assert result.hour == 0
        assert result.minute == 0
        assert result.tzinfo == timezone.utc

    def test_datetime_at_end_of_day(self):
        """Test handling of 23:59:59 datetime."""
        from app.utils.datetime_utils import ensure_aware_utc

        eod = datetime(2025, 1, 15, 23, 59, 59)
        result = ensure_aware_utc(eod)

        assert result is not None
        assert result.hour == 23
        assert result.minute == 59
        assert result.second == 59

    def test_leap_year_february_29(self):
        """Test handling of leap year date."""
        from app.utils.datetime_utils import ensure_aware_utc

        leap = datetime(2024, 2, 29, 12, 0, 0)  # 2024 is a leap year
        result = ensure_aware_utc(leap)

        assert result is not None
        assert result.month == 2
        assert result.day == 29

    def test_dst_transition_time(self):
        """Test handling of DST transition time."""
        from app.utils.datetime_utils import ensure_aware_utc

        # This is during DST in US Eastern time
        est = ZoneInfo("America/New_York")
        dst_time = datetime(2025, 3, 9, 3, 0, 0, tzinfo=est)

        result = ensure_aware_utc(dst_time)

        assert result is not None
        assert result.tzinfo == timezone.utc
