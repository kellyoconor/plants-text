from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api import plants, evaluations

# Create FastAPI instance
app = FastAPI(
    title=settings.project_name,
    version="1.0.0",
    description="Plant Texts API - Give your plants a personality!",
    debug=settings.debug
)

# CORS middleware for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(plants.router, prefix=settings.api_v1_prefix, tags=["plants"])
app.include_router(evaluations.router, prefix=f"{settings.api_v1_prefix}/evaluations", tags=["evaluations"])

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
