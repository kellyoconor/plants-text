#!/usr/bin/env python3
"""
Simple script to set up plant images for the database
"""
import os
import shutil
import json
from pathlib import Path

def main():
    print("🌱 Setting up plant images...")
    
    # Paths
    project_root = Path(__file__).parent
    kaggle_path = Path("/Users/kocono760@cable.comcast.com/Downloads/house_plant_species")
    images_dir = project_root / "frontend" / "public" / "images" / "plants"
    plant_data_path = project_root / "backend" / "house_plants.json"
    
    print(f"Project root: {project_root}")
    print(f"Kaggle path: {kaggle_path}")
    print(f"Images dir: {images_dir}")
    
    # Create images directory
    images_dir.mkdir(parents=True, exist_ok=True)
    print(f"✅ Created directory: {images_dir}")
    
    # Check if Kaggle dataset exists
    if not kaggle_path.exists():
        print(f"❌ Kaggle dataset not found at: {kaggle_path}")
        return
    
    print(f"✅ Found Kaggle dataset with {len(list(kaggle_path.iterdir()))} folders")
    
    # Load plant database
    try:
        with open(plant_data_path, 'r') as f:
            plants = json.load(f)
        print(f"✅ Loaded {len(plants)} plants from database")
    except Exception as e:
        print(f"❌ Error loading plant database: {e}")
        return
    
    # Copy some key images
    image_mappings = [
        # (kaggle_folder, output_filename, plant_info)
        ("Monstera Deliciosa (Monstera deliciosa)", "monstera.jpg", "Monstera"),
        ("Snake plant (Sanseviera)", "snake_plant.jpg", "Snake Plant"),
        ("Pothos (Ivy arum)", "pothos.jpg", "Pothos"),
        ("ZZ Plant (Zamioculcas zamiifolia)", "zz_plant.jpg", "ZZ Plant"),
        ("Rubber Plant (Ficus elastica)", "rubber_plant.jpg", "Rubber Plant"),
        ("Peace lily", "peace_lily.jpg", "Peace Lily"),
        ("Jade plant (Crassula ovata)", "jade_plant.jpg", "Jade Plant"),
        ("Aloe Vera", "aloe_vera.jpg", "Aloe Vera"),
        ("Birds Nest Fern (Asplenium nidus)", "birds_nest_fern.jpg", "Bird's Nest Fern"),
        ("Boston Fern (Nephrolepis exaltata)", "boston_fern.jpg", "Boston Fern"),
        ("Parlor Palm (Chamaedorea elegans)", "parlor_palm.jpg", "Parlor Palm"),
        ("Areca Palm (Dypsis lutescens)", "areca_palm.jpg", "Areca Palm"),
        ("Chinese evergreen (Aglaonema)", "chinese_evergreen.jpg", "Chinese Evergreen"),
        ("Dracaena", "dracaena.jpg", "Dracaena"),
        ("Bird of Paradise (Strelitzia reginae)", "bird_of_paradise.jpg", "Bird of Paradise"),
    ]
    
    copied_count = 0
    
    for kaggle_folder, output_filename, plant_name in image_mappings:
        source_folder = kaggle_path / kaggle_folder
        
        if source_folder.exists():
            # Find a good image (3rd one usually better quality than 1st)
            image_files = list(source_folder.glob("*.jpg")) + list(source_folder.glob("*.jpeg"))
            
            if image_files:
                # Sort and pick a good one
                image_files.sort()
                selected_image = image_files[min(2, len(image_files)-1)]
                
                # Copy to our images directory
                dest_path = images_dir / output_filename
                
                try:
                    shutil.copy2(selected_image, dest_path)
                    print(f"✅ {plant_name}: {selected_image.name} → {output_filename}")
                    copied_count += 1
                except Exception as e:
                    print(f"❌ Failed to copy {plant_name}: {e}")
            else:
                print(f"⚠️  No images found in {kaggle_folder}")
        else:
            print(f"⚠️  Folder not found: {kaggle_folder}")
    
    print(f"\n🎉 Successfully copied {copied_count} plant images!")
    
    # List what we have
    print(f"\n📸 Images in {images_dir}:")
    if images_dir.exists():
        for img_file in sorted(images_dir.glob("*.jpg")):
            file_size = img_file.stat().st_size / 1024  # KB
            print(f"   • {img_file.name} ({file_size:.1f} KB)")
    
    print(f"\n💡 Next steps:")
    print(f"   1. Update your React components to display these images")
    print(f"   2. Add image URLs to your plant database")
    print(f"   3. Create a mapping between plant IDs and image filenames")

if __name__ == "__main__":
    main()
