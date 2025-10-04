"""
Authentication and authorization utilities
"""

from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from .config import settings
import logging

logger = logging.getLogger(__name__)

# API Key header for admin endpoints
API_KEY_HEADER = APIKeyHeader(name="X-Admin-API-Key", auto_error=False)


async def verify_admin_key(api_key: str = Security(API_KEY_HEADER)) -> str:
    """
    Verify admin API key for protected endpoints
    
    Usage:
        @router.get("/admin/endpoint", dependencies=[Depends(verify_admin_key)])
        def admin_endpoint():
            ...
    
    Raises:
        HTTPException: 403 if API key is invalid or missing
    
    Returns:
        str: The validated API key
    """
    # Check if admin API key is configured
    if not settings.admin_api_key:
        logger.error("Admin API key not configured in environment")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin API not configured"
        )
    
    # Check if API key was provided
    if not api_key:
        logger.warning("Admin endpoint accessed without API key")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin API key required. Provide 'X-Admin-API-Key' header."
        )
    
    # Verify API key matches
    if api_key != settings.admin_api_key:
        logger.warning("Invalid admin API key attempted")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid admin API key"
        )
    
    logger.info("Admin API key verified successfully")
    return api_key
