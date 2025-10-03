#!/usr/bin/env python3
"""
Simple script to add phone verification columns to the database
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Get database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/plants_text')

def add_phone_verification_columns():
    """Add phone verification columns to users table"""
    try:
        # Connect to database
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print("Connected to database successfully!")
        
        # Add columns if they don't exist
        print("Adding phone_verified column...")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false")
        
        print("Adding verified_at column...")
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE")
        
        # Set existing users to verified=true
        print("Setting existing users to verified=true...")
        cursor.execute("UPDATE users SET phone_verified = true WHERE phone_verified IS NULL")
        
        print("✅ Phone verification columns added successfully!")
        
        # Verify the columns exist
        cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name IN ('phone_verified', 'verified_at')")
        columns = cursor.fetchall()
        print(f"✅ Verified columns exist: {[col[0] for col in columns]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    add_phone_verification_columns()
