from datetime import datetime, timezone
from typing import Optional

def ensure_aware_utc(dt: Optional[datetime]) -> Optional[datetime]:
    """
    Ensures a datetime object is timezone-aware and set to UTC.

    - If dt is None, returns None.
    - If dt is naive, it's assumed to be in UTC and is made timezone-aware.
    - If dt is aware, it's converted to UTC.

    Args:
        dt: The datetime object to process.

    Returns:
        A timezone-aware datetime object in UTC, or None.
    
    Example:
        # Naive datetime
        naive_dt = datetime(2025, 1, 1, 12, 0, 0)
        aware_utc_dt = ensure_aware_utc(naive_dt)
        # aware_utc_dt is datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)

        # Aware datetime in a different timezone
        import zoneinfo
        ny_tz = zoneinfo.ZoneInfo("America/New_York")
        aware_ny_dt = datetime(2025, 1, 1, 7, 0, 0, tzinfo=ny_tz)
        aware_utc_dt_converted = ensure_aware_utc(aware_ny_dt)
        # aware_utc_dt_converted is datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)
    """
    if dt is None:
        return None
    
    if dt.tzinfo is None:
        # If naive, assume UTC and make it aware
        return dt.replace(tzinfo=timezone.utc)
    else:
        # If aware, convert to UTC
        return dt.astimezone(timezone.utc)
