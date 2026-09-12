from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.health import router as health_router
from app.api.routes.reports import router as reports_router
from app.api.routes.procedures import router as procedures_router
from app.api.routes.dashboard import router as dashboard_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API and LangGraph agent orchestrator for Nigraan Civic Intelligence Copilot",
)

# CORS Middleware configuration (allow all origins for Vercel + Ngrok tunnels)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(health_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(procedures_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "health": "/api/health",
        "status": "operational",
    }
