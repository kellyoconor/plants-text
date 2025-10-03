#!/usr/bin/env python3
"""
Script to copy plant images from the downloaded dataset to our frontend.
Matches dataset species names to our database plant names.
"""

import os
import shutil
from pathlib import Path

# Mapping: Dataset folder name → Our database plant name
PLANT_MAPPINGS = {
    "Areca Palm (Dypsis lutescens)": "areca_palm",
    "Boston Fern (Nephrolepis exaltata)": "boston_fern",
    "Cast Iron Plant (Aspidistra elatior)": "cast_iron_plant",
    "Chinese evergreen (Aglaonema)": "chinese_evergreen",
    "Dracaena": "dracaena",
    "Elephant Ear (Alocasia spp.)": "elephant_ear",
    "English Ivy (Hedera helix)": "english_ivy",
    "Jade plant (Crassula ovata)": "jade_plant",
    "Monstera Deliciosa (Monstera deliciosa)": "monstera",
    "Parlor Palm (Chamaedorea elegans)": "parlor_palm",
    "Peace lily": "peace_lily",
    "Pothos (ivy arum)": "pothos",
    "Rubber Plant (Ficus elastica)": "rubber_plant",
    "Sago Palm (Cycas revoluta)": "sago_palm",
    "Snake plant (Sansevieria)": "snake_plant",
    "ZZ Plant (Zamioculcas zamiifolia)": "zz_plant",
    "Birds Nest Fern (Asplenium nidus)": "birdsnest_fern",
    "Prayer Plant (Maranta leuconeura)": "prayer_plant",
    "Spider Plant": "spider_plant",
    "Calathea": "calathea",
    "Orchid": "orchid",
}

def find_best_image(folder_path):
    """Find the best image in a folder (prefer JPG, pick first alphabetically)"""
    valid_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    images = []
    
    for file in folder_path.iterdir():
        if file.suffix.lower() in valid_extensions and not file.name.startswith('.'):
            images.append(file)
    
    if not images:
        return None
    
    # Prefer JPG files
    jpg_images = [img for img in images if img.suffix.lower() in {'.jpg', '.jpeg'}]
    if jpg_images:
        return sorted(jpg_images)[0]
    
    return sorted(images)[0]

def copy_plant_images(source_dir, dest_dir):
    """Copy plant images from source to destination"""
    source_path = Path(source_dir).expanduser()
    dest_path = Path(dest_dir)
    
    # Create destination directory if it doesn't exist
    dest_path.mkdir(parents=True, exist_ok=True)
    
    copied = []
    not_found = []
    
    print(f"📂 Looking for plant folders in: {source_path}")
    print(f"📤 Copying images to: {dest_path}\n")
    
    for dataset_name, our_name in PLANT_MAPPINGS.items():
        folder_path = source_path / dataset_name
        
        if not folder_path.exists():
            not_found.append(dataset_name)
            print(f"❌ Not found: {dataset_name}")
            continue
        
        # Find best image in folder
        best_image = find_best_image(folder_path)
        
        if not best_image:
            print(f"⚠️  No images in: {dataset_name}")
            continue
        
        # Copy to destination with our naming convention
        dest_file = dest_path / f"{our_name}{best_image.suffix}"
        shutil.copy2(best_image, dest_file)
        copied.append((dataset_name, our_name, best_image.name))
        print(f"✅ Copied: {dataset_name} → {our_name}{best_image.suffix}")
    
    print(f"\n🎉 Summary:")
    print(f"   ✅ Copied: {len(copied)} images")
    print(f"   ❌ Not found: {len(not_found)} folders")
    
    if not_found:
        print(f"\n⚠️  Missing folders:")
        for name in not_found:
            print(f"   - {name}")

if __name__ == "__main__":
    import sys
    
    # Default paths
    source_dir = "~/Downloads/house_plant_species"
    dest_dir = "./frontend/public/images/plants"
    
    # Allow command line override
    if len(sys.argv) > 1:
        source_dir = sys.argv[1]
    if len(sys.argv) > 2:
        dest_dir = sys.argv[2]
    
    print("🌱 Plant Image Copy Script\n")
    copy_plant_images(source_dir, dest_dir)
    print("\n✨ Done!")


