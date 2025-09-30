#!/usr/bin/env python3
"""
Script to match Kaggle plant images with our plant database
"""
import os
import json
import shutil
from pathlib import Path
from fuzzywuzzy import fuzz
import random

# Configuration
KAGGLE_PATH = "/Users/kocono760@cable.comcast.com/Downloads/house_plant_species"
OUTPUT_PATH = "/Users/kocono760@cable.comcast.com/plants-texts/frontend/public/images/plants"
PLANT_DATA_PATH = "/Users/kocono760@cable.comcast.com/plants-texts/backend/house_plants.json"

def load_plant_data():
    """Load our plant database"""
    with open(PLANT_DATA_PATH, 'r') as f:
        return json.load(f)

def get_kaggle_folders():
    """Get list of available Kaggle image folders"""
    return [f for f in os.listdir(KAGGLE_PATH) if os.path.isdir(os.path.join(KAGGLE_PATH, f))]

def normalize_name(name):
    """Normalize plant names for better matching"""
    return name.lower().replace('_', ' ').replace('-', ' ').replace('(', '').replace(')', '').strip()

def find_best_match(plant, kaggle_folders):
    """Find the best matching Kaggle folder for a plant"""
    
    # Extract plant names to match against
    plant_names = []
    
    # Add common names
    if 'common' in plant:
        plant_names.extend([normalize_name(name) for name in plant['common']])
    
    # Add latin name parts
    if 'latin' in plant:
        latin_parts = plant['latin'].split()
        plant_names.append(normalize_name(latin_parts[0]))  # Genus
        if len(latin_parts) > 1:
            plant_names.append(normalize_name(' '.join(latin_parts[:2])))  # Genus species
    
    # Add category if relevant
    if 'category' in plant:
        category = normalize_name(plant['category'])
        if category in ['fern', 'palm', 'succulent', 'cactus']:
            plant_names.append(category)
    
    best_score = 0
    best_folder = None
    
    print(f"\nLooking for matches for: {plant_names}")
    
    for folder in kaggle_folders:
        folder_normalized = normalize_name(folder)
        
        for plant_name in plant_names:
            # Direct match
            if plant_name in folder_normalized or folder_normalized in plant_name:
                score = 100
            else:
                # Fuzzy match
                score = fuzz.ratio(plant_name, folder_normalized)
            
            if score > best_score:
                best_score = score
                best_folder = folder
                print(f"  Potential match: '{plant_name}' -> '{folder}' (score: {score})")
    
    # Only return matches above threshold
    if best_score >= 70:
        print(f"  ✅ SELECTED: '{best_folder}' (score: {best_score})")
        return best_folder
    else:
        print(f"  ❌ No good match found (best score: {best_score})")
        return None

def copy_best_image(source_folder, plant_id, plant_name):
    """Copy the best image from source folder to our project"""
    source_path = os.path.join(KAGGLE_PATH, source_folder)
    
    # Get all image files
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        image_files.extend(Path(source_path).glob(ext))
    
    if not image_files:
        print(f"    No images found in {source_folder}")
        return None
    
    # Select a good representative image (not the first, which might be low quality)
    # Try to get one from the middle of the sorted list
    image_files.sort()
    selected_image = image_files[len(image_files) // 3] if len(image_files) > 2 else image_files[0]
    
    # Create output directory
    os.makedirs(OUTPUT_PATH, exist_ok=True)
    
    # Copy and rename
    dest_filename = f"plant_{plant_id}.jpg"
    dest_path = os.path.join(OUTPUT_PATH, dest_filename)
    
    try:
        shutil.copy2(selected_image, dest_path)
        print(f"    ✅ Copied {selected_image.name} -> {dest_filename}")
        return f"/images/plants/{dest_filename}"
    except Exception as e:
        print(f"    ❌ Failed to copy {selected_image}: {e}")
        return None

def main():
    """Main function to process all plant images"""
    print("🌱 Plant Image Matching Script")
    print("=" * 50)
    
    # Load data
    plants = load_plant_data()
    kaggle_folders = get_kaggle_folders()
    
    print(f"Found {len(plants)} plants in database")
    print(f"Found {len(kaggle_folders)} image folders in Kaggle dataset")
    print()
    
    # Manual mappings for hard-to-match plants
    manual_mappings = {
        'Snake plant': 'Snake plant (Sanseviera)',
        'Peace lily': 'Peace lily',
        'Monstera': 'Monstera Deliciosa (Monstera deliciosa)',
        'Pothos': 'Pothos (Ivy arum)',
        'ZZ plant': 'ZZ Plant (Zamioculcas zamiifolia)',
        'Rubber plant': 'Rubber Plant (Ficus elastica)',
        'Chinese evergreen': 'Chinese evergreen (Aglaonema)',
        'Dracaena': 'Dracaena',
        'Jade plant': 'Jade plant (Crassula ovata)',
        'Bird of paradise': 'Bird of Paradise (Strelitzia reginae)',
        'Parlor palm': 'Parlor Palm (Chamaedorea elegans)',
        'Boston fern': 'Boston Fern (Nephrolepis exaltata)',
        'Spider plant': None,  # Not in Kaggle dataset
        'Fiddle leaf fig': None,  # Not in Kaggle dataset
    }
    
    matched_count = 0
    results = []
    
    for plant in plants[:50]:  # Process first 50 plants for now
        plant_id = plant['id']
        common_names = plant.get('common', [])
        
        print(f"\n--- Plant {plant_id}: {common_names} ---")
        
        # Check manual mappings first
        manual_match = None
        for common_name in common_names:
            if normalize_name(common_name) in [normalize_name(k) for k in manual_mappings.keys()]:
                manual_match = manual_mappings.get(common_name)
                break
        
        if manual_match:
            if manual_match in kaggle_folders:
                print(f"Using manual mapping: {manual_match}")
                image_url = copy_best_image(manual_match, plant_id, common_names[0] if common_names else 'Unknown')
                if image_url:
                    matched_count += 1
                    results.append({
                        'plant_id': plant_id,
                        'plant_name': common_names[0] if common_names else 'Unknown',
                        'kaggle_folder': manual_match,
                        'image_url': image_url
                    })
        else:
            # Auto-match
            best_folder = find_best_match(plant, kaggle_folders)
            if best_folder:
                image_url = copy_best_image(best_folder, plant_id, common_names[0] if common_names else 'Unknown')
                if image_url:
                    matched_count += 1
                    results.append({
                        'plant_id': plant_id,
                        'plant_name': common_names[0] if common_names else 'Unknown',
                        'kaggle_folder': best_folder,
                        'image_url': image_url
                    })
    
    print("\n" + "=" * 50)
    print(f"✅ Successfully matched {matched_count} plants with images")
    print(f"📁 Images saved to: {OUTPUT_PATH}")
    
    # Save results for reference
    with open('plant_image_mapping.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("📋 Mapping saved to: plant_image_mapping.json")
    print("\nNext step: Run update_plant_database.py to add image URLs to the database")

if __name__ == "__main__":
    main()
