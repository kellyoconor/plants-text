from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api import plants, evaluations, sms, sms_demo
from .core.database import engine, Base

# Create FastAPI instance
app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    description="Plant Texts API - Give your plants a personality!",
    debug=settings.debug
)

# Create database tables on startup
@app.on_event("startup")
def startup_event():
    """Create database tables if they don't exist"""
    # Import all models so they're registered with Base
    from .models import sms_log
    Base.metadata.create_all(bind=engine)

# CORS middleware for frontend development and production
# Origins are configured via CORS_ORIGINS environment variable
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(plants.router, prefix=settings.api_v1_prefix, tags=["plants"])
app.include_router(evaluations.router, prefix=f"{settings.api_v1_prefix}/evaluations", tags=["evaluations"])
app.include_router(sms.router, prefix=f"{settings.api_v1_prefix}/sms", tags=["sms"])
app.include_router(sms_demo.router, prefix=f"{settings.api_v1_prefix}/sms", tags=["sms-demo"])

@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "Plant Texts API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
