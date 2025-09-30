#!/bin/bash

echo "🌱 Quick Plant Image Copy Script"
echo "================================"

# Create directory
mkdir -p "frontend/public/images/plants"

# Source and destination paths
KAGGLE="/Users/kocono760@cable.comcast.com/Downloads/house_plant_species"
DEST="frontend/public/images/plants"

echo "📁 Created directory: $DEST"
echo "📂 Source: $KAGGLE"
echo ""

# Copy key plant images based on what we found in the database
echo "Copying images for database plants..."

# Monstera (ID 118 from grep results)
if [ -f "$KAGGLE/Monstera Deliciosa (Monstera deliciosa)/3.jpg" ]; then
    cp "$KAGGLE/Monstera Deliciosa (Monstera deliciosa)/3.jpg" "$DEST/plant_118.jpg"
    echo "✅ Monstera (plant_118.jpg)"
fi

# Rubber Plants (IDs from grep: around 89, 102, 113)
if [ -f "$KAGGLE/Rubber Plant (Ficus elastica)/3.jpg" ]; then
    cp "$KAGGLE/Rubber Plant (Ficus elastica)/3.jpg" "$DEST/plant_89.jpg"
    cp "$KAGGLE/Rubber Plant (Ficus elastica)/4.jpg" "$DEST/plant_102.jpg" 2>/dev/null
    cp "$KAGGLE/Rubber Plant (Ficus elastica)/5.jpg" "$DEST/plant_113.jpg" 2>/dev/null
    echo "✅ Rubber Plants (plant_89, plant_102, plant_113)"
fi

# Pothos (IDs from grep: around 94, 105)
if [ -f "$KAGGLE/Pothos (Ivy arum)/3.jpg" ]; then
    cp "$KAGGLE/Pothos (Ivy arum)/3.jpg" "$DEST/plant_94.jpg"
    cp "$KAGGLE/Pothos (Ivy arum)/4.jpg" "$DEST/plant_105.jpg" 2>/dev/null
    echo "✅ Pothos (plant_94, plant_105)"
fi

# Jade Plants (IDs from grep: around 56, 76)
if [ -f "$KAGGLE/Jade plant (Crassula ovata)/3.jpg" ]; then
    cp "$KAGGLE/Jade plant (Crassula ovata)/3.jpg" "$DEST/plant_56.jpg"
    cp "$KAGGLE/Jade plant (Crassula ovata)/4.jpg" "$DEST/plant_76.jpg" 2>/dev/null
    echo "✅ Jade Plants (plant_56, plant_76)"
fi

# Peace Lilies (multiple IDs from grep)
if [ -f "$KAGGLE/Peace lily/3.jpg" ]; then
    cp "$KAGGLE/Peace lily/3.jpg" "$DEST/plant_171.jpg"
    cp "$KAGGLE/Peace lily/4.jpg" "$DEST/plant_172.jpg" 2>/dev/null
    cp "$KAGGLE/Peace lily/5.jpg" "$DEST/plant_183.jpg" 2>/dev/null
    echo "✅ Peace Lilies (plant_171, plant_172, plant_183)"
fi

# Palms (various IDs)
if [ -f "$KAGGLE/Parlor Palm (Chamaedorea elegans)/3.jpg" ]; then
    cp "$KAGGLE/Parlor Palm (Chamaedorea elegans)/3.jpg" "$DEST/plant_41.jpg"  # Parlor palm
    echo "✅ Parlor Palm (plant_41)"
fi

if [ -f "$KAGGLE/Areca Palm (Dypsis lutescens)/3.jpg" ]; then
    cp "$KAGGLE/Areca Palm (Dypsis lutescens)/3.jpg" "$DEST/plant_90.jpg"  # Butterfly palm
    echo "✅ Areca/Butterfly Palm (plant_90)"
fi

# Ferns
if [ -f "$KAGGLE/Birds Nest Fern (Asplenium nidus)/3.jpg" ]; then
    cp "$KAGGLE/Birds Nest Fern (Asplenium nidus)/3.jpg" "$DEST/plant_63.jpg"  # Birdnest fern
    echo "✅ Bird's Nest Fern (plant_63)"
fi

if [ -f "$KAGGLE/Boston Fern (Nephrolepis exaltata)/3.jpg" ]; then
    cp "$KAGGLE/Boston Fern (Nephrolepis exaltata)/3.jpg" "$DEST/plant_141.jpg"  # Sword fern
    echo "✅ Boston/Sword Fern (plant_141)"
fi

# Popular houseplants
if [ -f "$KAGGLE/Snake plant (Sanseviera)/3.jpg" ]; then
    cp "$KAGGLE/Snake plant (Sanseviera)/3.jpg" "$DEST/snake_plant.jpg"
    echo "✅ Snake Plant (snake_plant.jpg)"
fi

if [ -f "$KAGGLE/ZZ Plant (Zamioculcas zamiifolia)/3.jpg" ]; then
    cp "$KAGGLE/ZZ Plant (Zamioculcas zamiifolia)/3.jpg" "$DEST/zz_plant.jpg"
    echo "✅ ZZ Plant (zz_plant.jpg)"
fi

if [ -f "$KAGGLE/Aloe Vera/3.jpg" ]; then
    cp "$KAGGLE/Aloe Vera/3.jpg" "$DEST/aloe_vera.jpg"
    echo "✅ Aloe Vera (aloe_vera.jpg)"
fi

echo ""
echo "📸 Listing copied images:"
ls -la "$DEST/"

echo ""
echo "🎉 Image copying complete!"
echo "📁 Images are in: frontend/public/images/plants/"
