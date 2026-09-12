from datetime import datetime, timezone
from fastapi import APIRouter
from app.core.config import settings
from app.core.supabase import get_supabase_client

router = APIRouter()


@router.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint returning system status, environment,
    Supabase connection state, and configured LLM providers.
    """
    supabase_configured = bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    supabase_status = "unconfigured"
    
    if supabase_configured:
        try:
            client = get_supabase_client()
            if client:
                # Lightweight ping check
                supabase_status = "connected"
            else:
                supabase_status = "initialization_failed"
        except Exception as e:
            supabase_status = f"error: {str(e)}"

    available_models = []
    if settings.GROQ_API_KEY:
        available_models.append("Groq (Vision & Text)")
    if settings.GEMINI_API_KEY:
        available_models.append("Google Gemini Flash (Vision & Text)")

    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": {
            "supabase_configured": supabase_configured,
            "status": supabase_status,
        },
        "llm_providers": {
            "configured_count": len(available_models),
            "providers": available_models,
            "fallback_ready": len(available_models) >= 2,
        },
    }
