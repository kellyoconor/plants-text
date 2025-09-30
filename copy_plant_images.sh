#!/bin/bash

# Create images directory
mkdir -p frontend/public/images/plants

# Copy popular plant images from Kaggle dataset
KAGGLE_PATH="/Users/kocono760@cable.comcast.com/Downloads/house_plant_species"
DEST_PATH="frontend/public/images/plants"

echo "🌱 Copying plant images..."

# Snake Plant
cp "$KAGGLE_PATH/Snake plant (Sanseviera)/1.jpg" "$DEST_PATH/snake_plant.jpg"
echo "✅ Snake Plant"

# Monstera
cp "$KAGGLE_PATH/Monstera Deliciosa (Monstera deliciosa)/1.jpg" "$DEST_PATH/monstera.jpg" 
echo "✅ Monstera"

# Pothos
cp "$KAGGLE_PATH/Pothos (Ivy arum)/1.jpg" "$DEST_PATH/pothos.jpg"
echo "✅ Pothos"

# ZZ Plant
cp "$KAGGLE_PATH/ZZ Plant (Zamioculcas zamiifolia)/1.jpg" "$DEST_PATH/zz_plant.jpg"
echo "✅ ZZ Plant"

# Rubber Plant
cp "$KAGGLE_PATH/Rubber Plant (Ficus elastica)/1.jpg" "$DEST_PATH/rubber_plant.jpg"
echo "✅ Rubber Plant"

# Peace Lily
cp "$KAGGLE_PATH/Peace lily/1.jpg" "$DEST_PATH/peace_lily.jpg"
echo "✅ Peace Lily"

# Chinese Evergreen
cp "$KAGGLE_PATH/Chinese evergreen (Aglaonema)/1.jpg" "$DEST_PATH/chinese_evergreen.jpg"
echo "✅ Chinese Evergreen"

# Dracaena
cp "$KAGGLE_PATH/Dracaena/1.jpg" "$DEST_PATH/dracaena.jpg"
echo "✅ Dracaena"

# Jade Plant
cp "$KAGGLE_PATH/Jade plant (Crassula ovata)/1.jpg" "$DEST_PATH/jade_plant.jpg"
echo "✅ Jade Plant"

# Bird of Paradise
cp "$KAGGLE_PATH/Bird of Paradise (Strelitzia reginae)/1.jpg" "$DEST_PATH/bird_of_paradise.jpg"
echo "✅ Bird of Paradise"

# Parlor Palm
cp "$KAGGLE_PATH/Parlor Palm (Chamaedorea elegans)/1.jpg" "$DEST_PATH/parlor_palm.jpg"
echo "✅ Parlor Palm"

# Boston Fern
cp "$KAGGLE_PATH/Boston Fern (Nephrolepis exaltata)/1.jpg" "$DEST_PATH/boston_fern.jpg"
echo "✅ Boston Fern"

# Money Tree
cp "$KAGGLE_PATH/Money Tree (Pachira aquatica)/1.jpg" "$DEST_PATH/money_tree.jpg"
echo "✅ Money Tree"

# Aloe Vera
cp "$KAGGLE_PATH/Aloe Vera/1.jpg" "$DEST_PATH/aloe_vera.jpg"
echo "✅ Aloe Vera"

# Orchid
cp "$KAGGLE_PATH/Orchid/1.jpg" "$DEST_PATH/orchid.jpg"
echo "✅ Orchid"

echo "🎉 Copied 15 plant images successfully!"
echo "📁 Images are in: $DEST_PATH"

# List the copied files
echo ""
echo "📸 Copied images:"
ls -la "$DEST_PATH/"
