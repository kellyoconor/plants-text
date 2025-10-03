"""
One-time migration endpoint
"""

from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from ..core.database import SessionLocal

router = APIRouter()

@router.post("/fix-phone-verification")
async def fix_phone_verification():
    """One-time fix to add phone verification columns"""
    db = SessionLocal()
    try:
        print("Starting phone verification migration...")
        
        # Add columns if they don't exist
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false"))
        print("Added phone_verified column")
        
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE"))
        print("Added verified_at column")
        
        # Set existing users to verified=true
        db.execute(text("UPDATE users SET phone_verified = true WHERE phone_verified IS NULL"))
        print("Set existing users to verified=true")
        
        db.commit()
        print("Migration completed successfully!")
        
        return {
            "status": "success", 
            "message": "Phone verification columns added successfully"
        }
        
    except Exception as e:
        db.rollback()
        print(f"Migration failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()
