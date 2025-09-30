#!/bin/bash

echo "🌱 Copying Plant Images - Final Version"
echo "======================================"

# Create directory
mkdir -p frontend/public/images/plants
echo "✅ Created directory: frontend/public/images/plants"

# Source path
KAGGLE="/Users/kocono760@cable.comcast.com/Downloads/house_plant_species"
DEST="frontend/public/images/plants"

# Copy images with error handling
copy_image() {
    local source_folder="$1"
    local dest_name="$2"
    local plant_name="$3"
    
    if [ -f "$KAGGLE/$source_folder/3.jpg" ]; then
        cp "$KAGGLE/$source_folder/3.jpg" "$DEST/$dest_name"
        echo "✅ $plant_name"
    elif [ -f "$KAGGLE/$source_folder/1.jpg" ]; then
        cp "$KAGGLE/$source_folder/1.jpg" "$DEST/$dest_name"
        echo "✅ $plant_name (used 1.jpg)"
    else
        echo "❌ $plant_name - no images found"
    fi
}

# Copy all plant images
copy_image "Monstera Deliciosa (Monstera deliciosa)" "monstera.jpg" "Monstera"
copy_image "Snake plant (Sanseviera)" "snake_plant.jpg" "Snake Plant"
copy_image "Pothos (Ivy arum)" "pothos.jpg" "Pothos"
copy_image "ZZ Plant (Zamioculcas zamiifolia)" "zz_plant.jpg" "ZZ Plant"
copy_image "Rubber Plant (Ficus elastica)" "rubber_plant.jpg" "Rubber Plant"
copy_image "Peace lily" "peace_lily.jpg" "Peace Lily"
copy_image "Jade plant (Crassula ovata)" "jade_plant.jpg" "Jade Plant"
copy_image "Aloe Vera" "aloe_vera.jpg" "Aloe Vera"
copy_image "Chinese evergreen (Aglaonema)" "chinese_evergreen.jpg" "Chinese Evergreen"
copy_image "Dracaena" "dracaena.jpg" "Dracaena"
copy_image "Birds Nest Fern (Asplenium nidus)" "birds_nest_fern.jpg" "Bird's Nest Fern"
copy_image "Boston Fern (Nephrolepis exaltata)" "boston_fern.jpg" "Boston Fern"
copy_image "Parlor Palm (Chamaedorea elegans)" "parlor_palm.jpg" "Parlor Palm"
copy_image "Areca Palm (Dypsis lutescens)" "areca_palm.jpg" "Areca Palm"
copy_image "Bird of Paradise (Strelitzia reginae)" "bird_of_paradise.jpg" "Bird of Paradise"
copy_image "Money Tree (Pachira aquatica)" "money_tree.jpg" "Money Tree"

echo ""
echo "📸 Final Results:"
ls -la "$DEST/"

echo ""
echo "🎉 Plant image setup complete!"
echo "📁 Images location: $DEST"
