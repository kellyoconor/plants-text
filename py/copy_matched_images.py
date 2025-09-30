#!/usr/bin/env python3
"""
Copy images for plants that have clear matches in the Kaggle dataset
"""
import json
import os
import shutil
from pathlib import Path

# Configuration
KAGGLE_PATH = "/Users/kocono760@cable.comcast.com/Downloads/house_plant_species"
OUTPUT_PATH = "frontend/public/images/plants"
PLANT_DATA_PATH = "backend/house_plants.json"

def load_plant_data():
    """Load our plant database"""
    with open(PLANT_DATA_PATH, 'r') as f:
        return json.load(f)

def copy_plant_image(kaggle_folder, plant_id, plant_name):
    """Copy the best image from Kaggle folder"""
    source_path = os.path.join(KAGGLE_PATH, kaggle_folder)
    
    # Get image files
    image_files = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.JPG', '*.JPEG', '*.PNG']:
        image_files.extend(Path(source_path).glob(ext))
    
    if not image_files:
        return None
    
    # Select a good image (not the first one, which might be poor quality)
    image_files.sort()
    selected_image = image_files[min(2, len(image_files)-1)]  # 3rd image or last if fewer
    
    # Create output directory
    os.makedirs(OUTPUT_PATH, exist_ok=True)
    
    # Copy and rename
    dest_filename = f"plant_{plant_id}.jpg"
    dest_path = os.path.join(OUTPUT_PATH, dest_filename)
    
    try:
        shutil.copy2(selected_image, dest_path)
        return f"/images/plants/{dest_filename}"
    except Exception as e:
        print(f"❌ Failed to copy {selected_image}: {e}")
        return None

def main():
    """Main function to copy matched plant images"""
    print("🌱 Copying Plant Images for Database Plants")
    print("=" * 50)
    
    # Load plant data
    plants = load_plant_data()
    
    # Define clear matches between database plants and Kaggle folders
    # Format: (plant_common_name_pattern, kaggle_folder_name)
    clear_matches = [
        # Exact matches
        ("Monstera", "Monstera Deliciosa (Monstera deliciosa)"),
        ("Golden Pothos", "Pothos (Ivy arum)"),
        ("White Pothos", "Pothos (Ivy arum)"),
        ("Rubber plant", "Rubber Plant (Ficus elastica)"),
        ("Jade Plant", "Jade plant (Crassula ovata)"),
        ("Peace lily", "Peace lily"),
        ("Parlor palm", "Parlor Palm (Chamaedorea elegans)"),
        ("Butterfly palm", "Areca Palm (Dypsis lutescens)"),
        ("Majesty palm", "Areca Palm (Dypsis lutescens)"),  # Close enough
        ("Lady palm", "Parlor Palm (Chamaedorea elegans)"),  # Close palm type
        
        # Ferns
        ("Birdnest fern", "Birds Nest Fern (Asplenium nidus)"),
        ("Sword fern", "Boston Fern (Nephrolepis exaltata)"),
        
        # Other matches
        ("Chinese evergreen", "Chinese evergreen (Aglaonema)"),
        ("Dracaena", "Dracaena"),
        ("Aloe", "Aloe Vera"),
        ("Snake plant", "Snake plant (Sanseviera)"),
        ("ZZ plant", "ZZ Plant (Zamioculcas zamiifolia)"),
        ("Money tree", "Money Tree (Pachira aquatica)"),
        ("Bird of paradise", "Bird of Paradise (Strelitzia reginae)"),
        ("English ivy", "English Ivy (Hedera helix)"),
        ("Calathea", "Calathea"),
        ("Begonia", "Begonia (Begonia spp.)"),
        ("Anthurium", "Anthurium (Anthurium andraeanum)"),
        ("Orchid", "Orchid"),
        ("African violet", "African Violet (Saintpaulia ionantha)"),
        ("Christmas cactus", "Christmas Cactus (Schlumbergera bridgesii)"),
        ("Poinsettia", "Poinsettia (Euphorbia pulcherrima)"),
        ("Hyacinth", "Hyacinth (Hyacinthus orientalis)"),
    ]
    
    # Create lookup for Kaggle folders
    kaggle_folders = [f for f in os.listdir(KAGGLE_PATH) if os.path.isdir(os.path.join(KAGGLE_PATH, f))]
    
    copied_count = 0
    results = []
    
    print(f"Processing {len(plants)} plants...")
    print()
    
    for plant in plants:
        plant_id = plant.get('id')
        common_names = plant.get('common', [])
        latin = plant.get('latin', '')
        
        # Check if this plant matches any of our clear matches
        kaggle_match = None
        matched_pattern = None
        
        for common_name in common_names:
            for pattern, kaggle_folder in clear_matches:
                if pattern.lower() in common_name.lower():
                    if kaggle_folder in kaggle_folders:
                        kaggle_match = kaggle_folder
                        matched_pattern = pattern
                        break
            if kaggle_match:
                break
        
        if kaggle_match:
            print(f"✅ Plant {plant_id}: {common_names[0]} → {kaggle_match}")
            
            # Copy the image
            image_url = copy_plant_image(kaggle_match, plant_id, common_names[0])
            
            if image_url:
                copied_count += 1
                results.append({
                    'plant_id': plant_id,
                    'plant_name': common_names[0],
                    'kaggle_folder': kaggle_match,
                    'image_url': image_url,
                    'matched_pattern': matched_pattern
                })
                print(f"    📸 Copied to: {image_url}")
            else:
                print(f"    ❌ Failed to copy image")
        else:
            # Only show first few unmatched for brevity
            if len(results) + len([p for p in plants if not any(pattern.lower() in name.lower() for name in p.get('common', []) for pattern, _ in clear_matches)]) <= 10:
                print(f"⚪ Plant {plant_id}: {common_names[0] if common_names else latin} (no clear match)")
    
    print("\n" + "=" * 50)
    print(f"✅ Successfully copied {copied_count} plant images")
    print(f"📁 Images saved to: {OUTPUT_PATH}")
    
    # Save results
    with open('plant_image_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print("📋 Results saved to: plant_image_results.json")
    
    # Show summary of what was copied
    print(f"\n📸 Images copied for these plants:")
    for result in results:
        print(f"   • {result['plant_name']} (ID: {result['plant_id']})")
    
    return results

if __name__ == "__main__":
    results = main()
