"""
Simple migration endpoint
"""

from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from ..core.database import SessionLocal

router = APIRouter()

@router.post("/add-phone-verification")
async def add_phone_verification():
    """Add phone verification columns to users table"""
    db = SessionLocal()
    try:
        # Add columns if they don't exist
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE"))
        
        # Set existing users to verified=true
        db.execute(text("UPDATE users SET phone_verified = true WHERE phone_verified IS NULL"))
        
        db.commit()
        
        return {"status": "success", "message": "Phone verification columns added"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
