#!/usr/bin/env python3
"""
Analyze which plants in our database have matching images in the Kaggle dataset
"""
import json
import os

# Paths
PLANT_DATA_PATH = "backend/house_plants.json"
KAGGLE_PATH = "/Users/kocono760@cable.comcast.com/Downloads/house_plant_species"

def load_plant_data():
    """Load our plant database"""
    with open(PLANT_DATA_PATH, 'r') as f:
        return json.load(f)

def get_kaggle_folders():
    """Get available Kaggle image folders"""
    if not os.path.exists(KAGGLE_PATH):
        print(f"❌ Kaggle path not found: {KAGGLE_PATH}")
        return []
    return [f for f in os.listdir(KAGGLE_PATH) if os.path.isdir(os.path.join(KAGGLE_PATH, f))]

def normalize_name(name):
    """Normalize plant names for matching"""
    return name.lower().replace('_', ' ').replace('-', ' ').replace('(', '').replace(')', '').strip()

def find_matches():
    """Find matches between our plants and Kaggle images"""
    plants = load_plant_data()
    kaggle_folders = get_kaggle_folders()
    
    print("🌱 Plant Database vs Kaggle Dataset Analysis")
    print("=" * 60)
    print(f"Plants in database: {len(plants)}")
    print(f"Kaggle image folders: {len(kaggle_folders)}")
    print()
    
    # Create normalized lookup for Kaggle folders
    kaggle_lookup = {}
    for folder in kaggle_folders:
        normalized = normalize_name(folder)
        kaggle_lookup[normalized] = folder
    
    matches = []
    no_matches = []
    
    print("🔍 Looking for matches...")
    print("-" * 40)
    
    for i, plant in enumerate(plants):
        plant_id = plant.get('id', i)
        common_names = plant.get('common', [])
        latin = plant.get('latin', '')
        
        # Try to find a match
        found_match = None
        
        # Check common names
        for common_name in common_names:
            normalized_common = normalize_name(common_name)
            
            # Direct match
            if normalized_common in kaggle_lookup:
                found_match = kaggle_lookup[normalized_common]
                break
            
            # Partial matches
            for kaggle_norm, kaggle_orig in kaggle_lookup.items():
                if normalized_common in kaggle_norm or kaggle_norm in normalized_common:
                    # Check if it's a good match (not too generic)
                    if len(normalized_common) > 3 and len(kaggle_norm) > 3:
                        found_match = kaggle_orig
                        break
            
            if found_match:
                break
        
        # Check latin name if no common name match
        if not found_match and latin:
            latin_parts = latin.split()
            if latin_parts:
                genus = normalize_name(latin_parts[0])
                for kaggle_norm, kaggle_orig in kaggle_lookup.items():
                    if genus in kaggle_norm:
                        found_match = kaggle_orig
                        break
        
        # Record result
        plant_info = {
            'id': plant_id,
            'common_names': common_names,
            'latin': latin,
            'kaggle_match': found_match
        }
        
        if found_match:
            matches.append(plant_info)
            print(f"✅ {common_names[0] if common_names else latin} → {found_match}")
        else:
            no_matches.append(plant_info)
            print(f"❌ {common_names[0] if common_names else latin} (no match)")
    
    print("\n" + "=" * 60)
    print(f"✅ MATCHES FOUND: {len(matches)}")
    print(f"❌ NO MATCHES: {len(no_matches)}")
    print(f"📊 MATCH RATE: {len(matches)/len(plants)*100:.1f}%")
    
    # Show top matches
    print(f"\n🎯 TOP MATCHES (first 10):")
    for match in matches[:10]:
        print(f"   {match['common_names'][0] if match['common_names'] else match['latin']}")
        print(f"   → {match['kaggle_match']}")
        print()
    
    # Show plants without matches
    print(f"\n🔍 PLANTS NEEDING IMAGES (first 10):")
    for no_match in no_matches[:10]:
        print(f"   {no_match['common_names'][0] if no_match['common_names'] else no_match['latin']}")
    
    if len(no_matches) > 10:
        print(f"   ... and {len(no_matches) - 10} more")
    
    return matches, no_matches

if __name__ == "__main__":
    matches, no_matches = find_matches()
