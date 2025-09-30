#!/usr/bin/env python3
"""
Script to update the plant database with image URLs
"""
import json
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
sys.path.append(str(Path(__file__).parent / 'backend'))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.app.models.plants import PlantCatalog
from backend.app.core.config import settings

def load_image_mapping():
    """Load the image mapping results"""
    try:
        with open('plant_image_mapping.json', 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        print("❌ plant_image_mapping.json not found. Run match_plant_images.py first.")
        return []

def update_database():
    """Update the database with image URLs"""
    print("🗄️  Updating plant database with image URLs...")
    
    # Create database connection
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Load image mappings
        mappings = load_image_mapping()
        
        if not mappings:
            print("No image mappings found.")
            return
        
        updated_count = 0
        
        for mapping in mappings:
            plant_id = mapping['plant_id']
            image_url = mapping['image_url']
            
            # Find the plant in the database
            plant = db.query(PlantCatalog).filter(PlantCatalog.id == plant_id + 1).first()  # +1 because DB IDs start at 1
            
            if plant:
                # Update care_requirements with image_url
                care_reqs = plant.care_requirements or {}
                care_reqs['image_url'] = image_url
                
                # Update the plant
                plant.care_requirements = care_reqs
                
                print(f"✅ Updated plant {plant.name} with image: {image_url}")
                updated_count += 1
            else:
                print(f"❌ Plant with ID {plant_id} not found in database")
        
        # Commit changes
        db.commit()
        print(f"\n🎉 Successfully updated {updated_count} plants with images!")
        
    except Exception as e:
        print(f"❌ Error updating database: {e}")
        db.rollback()
    finally:
        db.close()

def verify_images():
    """Verify that image files exist"""
    print("\n🔍 Verifying image files...")
    
    image_dir = Path("frontend/public/images/plants")
    if not image_dir.exists():
        print("❌ Image directory doesn't exist")
        return
    
    image_files = list(image_dir.glob("plant_*.jpg"))
    print(f"✅ Found {len(image_files)} image files")
    
    for img_file in sorted(image_files)[:10]:  # Show first 10
        print(f"   📸 {img_file.name}")
    
    if len(image_files) > 10:
        print(f"   ... and {len(image_files) - 10} more")

if __name__ == "__main__":
    verify_images()
    update_database()
