"""
FinSight AI - Financial Guardian System
Python FastAPI Backend
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import sentry_sdk
import logging
import os
from dotenv import load_dotenv

from api import (
    multi_agent,
    reports,
    portfolio,
    organizations,
    webhooks,
    feature_flags,
    alerts,
    ai_usage,
    demo_setup,
)
from config.database import engine, Base
from utils.logger import setup_logging

# Load environment variables
load_dotenv()

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Initialize Sentry for error tracking
if os.getenv("SENTRY_DSN"):
    sentry_sdk.init(
        dsn=os.getenv("SENTRY_DSN"),
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
        environment=os.getenv("ENVIRONMENT", "development"),
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown events"""
    # Startup
    logger.info("Starting FinSight AI Backend...")

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")

    yield

    # Shutdown
    logger.info("Shutting down FinSight AI Backend...")


# Initialize FastAPI app
app = FastAPI(
    title="FinSight AI - Financial Guardian System",
    description="Enterprise-grade AI-powered financial analysis and compliance platform",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS Configuration
cors_origins = [
    "http://localhost:3000",
    "http://localhost:3004",
    "http://localhost:3001",
    os.getenv("FRONTEND_URL", "http://localhost:3004"),
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if os.getenv("DEBUG") else "An unexpected error occurred",
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "FinSight AI Backend",
        "version": "2.0.0",
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "FinSight AI - Financial Guardian System API",
        "version": "2.0.0",
        "docs": "/api/docs",
    }


# Include routers
app.include_router(multi_agent.router, prefix="/api", tags=["Multi-Agent AI"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])
app.include_router(portfolio.router, prefix="/api", tags=["Portfolio"])
app.include_router(organizations.router, prefix="/api", tags=["Organizations"])
app.include_router(webhooks.router, prefix="/api", tags=["Webhooks"])
app.include_router(feature_flags.router, prefix="/api", tags=["Feature Flags"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"])
app.include_router(ai_usage.router, prefix="/api", tags=["AI Usage"])
app.include_router(demo_setup.router, prefix="/api", tags=["Demo Setup"])


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("DEBUG", "false").lower() == "true",
        log_level="info",
    )
