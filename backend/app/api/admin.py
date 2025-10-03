"""
Admin API endpoints for database management
"""

from fastapi import APIRouter, HTTPException
from sqlalchemy import text
from ..core.database import SessionLocal

router = APIRouter()

@router.post("/migrate/add-phone-verification")
async def add_phone_verification_columns():
    """
    Add phone_verified and verified_at columns to users table
    """
    db = SessionLocal()
    try:
        # Check if columns already exist
        result = db.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name IN ('phone_verified', 'verified_at')
        """))
        existing_columns = [row[0] for row in result.fetchall()]
        
        if 'phone_verified' not in existing_columns:
            db.execute(text("ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false"))
            print("Added phone_verified column")
        
        if 'verified_at' not in existing_columns:
            db.execute(text("ALTER TABLE users ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE"))
            print("Added verified_at column")
        
        # Set existing users to verified=true for backward compatibility
        db.execute(text("UPDATE users SET phone_verified = true WHERE phone_verified IS NULL"))
        
        db.commit()
        
        return {
            "status": "success",
            "message": "Phone verification columns added successfully",
            "existing_columns": existing_columns
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Migration failed: {str(e)}")
    finally:
        db.close()
