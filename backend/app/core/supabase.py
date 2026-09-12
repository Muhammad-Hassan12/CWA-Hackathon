from typing import Optional
from supabase import Client, create_client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns a cached Supabase Client instance.
    If SUPABASE_URL or SUPABASE_KEY are not configured, returns None and logs a warning.
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client
    
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
    if not settings.SUPABASE_URL or not key:
        logger.warning(
            "Supabase credentials not set (SUPABASE_URL / SUPABASE_KEY). Supabase operations will fail until set."
        )
        return None
    
    try:
        _supabase_client = create_client(settings.SUPABASE_URL, key)
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")
        return None
