/**
 * Plant Image Mapping
 * Maps plant names and IDs to their corresponding image files
 */

// Image mapping based on plant names and common names
export const PLANT_IMAGE_MAP: Record<string, string> = {
  // Popular houseplants
  'monstera': '/images/plants/monstera.jpg',
  'monstera deliciosa': '/images/plants/monstera.jpg',
  
  'snake plant': '/images/plants/snake_plant.jpg',
  'sansevieria': '/images/plants/snake_plant.jpg',
  'sanseviera': '/images/plants/snake_plant.jpg',
  'sansevieria trifasciata': '/images/plants/snake_plant.jpg',
  
  'pothos': '/images/plants/pothos.jpg',
  'golden pothos': '/images/plants/pothos.jpg',
  'white pothos': '/images/plants/pothos.jpg',
  'ivy arum': '/images/plants/pothos.jpg',
  
  'zz plant': '/images/plants/zz_plant.jpg',
  'zamioculcas': '/images/plants/zz_plant.jpg',
  'zamioculcas zamiifolia': '/images/plants/zz_plant.jpg',
  
  'rubber plant': '/images/plants/rubber_plant.jpg',
  'rubber tree': '/images/plants/rubber_plant.jpg',
  'ficus elastica': '/images/plants/rubber_plant.jpg',
  'tineke': '/images/plants/rubber_plant.jpg',
  'robusta': '/images/plants/rubber_plant.jpg',
  'burgandy': '/images/plants/rubber_plant.jpg',
  
  // Easy care plants
  'peace lily': '/images/plants/peace_lily.jpg',
  'spathiphyllum': '/images/plants/peace_lily.jpg',
  
  'jade plant': '/images/plants/jade_plant.jpg',
  'crassula': '/images/plants/jade_plant.jpg',
  'crassula ovata': '/images/plants/jade_plant.jpg',
  
  'aloe': '/images/plants/aloe_vera.jpg',
  'aloe vera': '/images/plants/aloe_vera.jpg',
  
  'chinese evergreen': '/images/plants/chinese_evergreen.jpg',
  'aglaonema': '/images/plants/chinese_evergreen.jpg',
  
  'dracaena': '/images/plants/dracaena.jpg',
  'dragon tree': '/images/plants/dracaena.jpg',
  'madagascar dragon tree': '/images/plants/dracaena.jpg',
  'cornstalk plant': '/images/plants/dracaena.jpg',
  'janet craig': '/images/plants/dracaena.jpg',
  
  // Ferns
  'fern': '/images/plants/boston_fern.jpg',
  'boston fern': '/images/plants/boston_fern.jpg',
  'sword fern': '/images/plants/boston_fern.jpg',
  'nephrolepis': '/images/plants/boston_fern.jpg',
  
  'birds nest fern': '/images/plants/birds_nest_fern.jpg',
  'bird nest fern': '/images/plants/birds_nest_fern.jpg',
  'birdnest fern': '/images/plants/birds_nest_fern.jpg',
  'asplenium': '/images/plants/birds_nest_fern.jpg',
  
  'maidenhair': '/images/plants/boston_fern.jpg',
  'delta maidenhair': '/images/plants/boston_fern.jpg',
  'tree maindenhair fern': '/images/plants/boston_fern.jpg',
  
  // Palms
  'palm': '/images/plants/parlor_palm.jpg',
  'parlor palm': '/images/plants/parlor_palm.jpg',
  'dwarf palm': '/images/plants/parlor_palm.jpg',
  'chamaedorea': '/images/plants/parlor_palm.jpg',
  
  'areca palm': '/images/plants/areca_palm.jpg',
  'butterfly palm': '/images/plants/areca_palm.jpg',
  'bamboo palm': '/images/plants/areca_palm.jpg',
  'reed palm': '/images/plants/areca_palm.jpg',
  'dypsis': '/images/plants/areca_palm.jpg',
  
  'fish tail palm': '/images/plants/parlor_palm.jpg',
  'fishtail palm': '/images/plants/parlor_palm.jpg',
  'steel palm': '/images/plants/parlor_palm.jpg',
  'sago palm': '/images/plants/parlor_palm.jpg',
  'king sago': '/images/plants/parlor_palm.jpg',
  'majesty palm': '/images/plants/areca_palm.jpg',
  'lady palm': '/images/plants/parlor_palm.jpg',
  'manila palm': '/images/plants/parlor_palm.jpg',
  'parrot palm': '/images/plants/parlor_palm.jpg',
  
  // Specialty plants
  'bird of paradise': '/images/plants/bird_of_paradise.jpg',
  'strelitzia': '/images/plants/bird_of_paradise.jpg',
  
  'money tree': '/images/plants/money_tree.jpg',
  'pachira': '/images/plants/money_tree.jpg',
  'pachira aquatica': '/images/plants/money_tree.jpg',
};

// Specific plant ID mappings (based on the database analysis)
export const PLANT_ID_MAP: Record<number, string> = {
  // Monstera
  118: '/images/plants/monstera.jpg',
  
  // Rubber Plants
  89: '/images/plants/rubber_plant.jpg',
  102: '/images/plants/rubber_plant.jpg',
  113: '/images/plants/rubber_plant.jpg',
  
  // Pothos
  94: '/images/plants/pothos.jpg',
  105: '/images/plants/pothos.jpg',
  
  // Jade Plants
  56: '/images/plants/jade_plant.jpg',
  76: '/images/plants/jade_plant.jpg',
  
  // Peace Lilies
  171: '/images/plants/peace_lily.jpg',
  172: '/images/plants/peace_lily.jpg',
  183: '/images/plants/peace_lily.jpg',
  184: '/images/plants/peace_lily.jpg',
  195: '/images/plants/peace_lily.jpg',
  
  // Chinese Evergreens (multiple IDs from grep results)
  8: '/images/plants/chinese_evergreen.jpg',
  9: '/images/plants/chinese_evergreen.jpg',
  10: '/images/plants/chinese_evergreen.jpg',
  11: '/images/plants/chinese_evergreen.jpg',
  12: '/images/plants/chinese_evergreen.jpg',
  13: '/images/plants/chinese_evergreen.jpg',
  14: '/images/plants/chinese_evergreen.jpg',
  15: '/images/plants/chinese_evergreen.jpg',
  16: '/images/plants/chinese_evergreen.jpg',
  17: '/images/plants/chinese_evergreen.jpg',
  18: '/images/plants/chinese_evergreen.jpg',
  19: '/images/plants/chinese_evergreen.jpg',
  20: '/images/plants/chinese_evergreen.jpg',
  21: '/images/plants/chinese_evergreen.jpg',
  22: '/images/plants/chinese_evergreen.jpg',
  23: '/images/plants/chinese_evergreen.jpg',
  24: '/images/plants/chinese_evergreen.jpg',
  25: '/images/plants/chinese_evergreen.jpg',
  26: '/images/plants/chinese_evergreen.jpg',
  27: '/images/plants/chinese_evergreen.jpg',
  28: '/images/plants/chinese_evergreen.jpg',
  29: '/images/plants/chinese_evergreen.jpg',
  30: '/images/plants/chinese_evergreen.jpg',
  
  // Dracaenas
  67: '/images/plants/dracaena.jpg',
  68: '/images/plants/dracaena.jpg',
  69: '/images/plants/dracaena.jpg',
  71: '/images/plants/dracaena.jpg',
  73: '/images/plants/dracaena.jpg',
  77: '/images/plants/dracaena.jpg',
  78: '/images/plants/dracaena.jpg',
  80: '/images/plants/dracaena.jpg',
  82: '/images/plants/dracaena.jpg',
  83: '/images/plants/dracaena.jpg',
  84: '/images/plants/dracaena.jpg',
  85: '/images/plants/dracaena.jpg',
  
  // Palms
  35: '/images/plants/parlor_palm.jpg', // Fish tail palm
  40: '/images/plants/parlor_palm.jpg', // Parlor palm
  45: '/images/plants/areca_palm.jpg',  // Bamboo palm
  51: '/images/plants/areca_palm.jpg',  // Bamboo palm
  59: '/images/plants/parlor_palm.jpg', // Steel palm
  74: '/images/plants/parlor_palm.jpg', // Sago palm
  90: '/images/plants/areca_palm.jpg',  // Butterfly palm
  
  // Ferns
  1: '/images/plants/boston_fern.jpg',   // Maidenhair
  6: '/images/plants/boston_fern.jpg',   // Maidenhair
  38: '/images/plants/boston_fern.jpg',  // Dwarf tree fern
  63: '/images/plants/birds_nest_fern.jpg', // Birdnest fern
  65: '/images/plants/boston_fern.jpg',  // Tree Maindenhair fern
  79: '/images/plants/boston_fern.jpg',  // Holly-fern
  81: '/images/plants/boston_fern.jpg',  // Rabbits foot fern
};

/**
 * Get plant image URL by plant name or ID
 */
export function getPlantImage(plant: { id?: number; name?: string; species?: string }): string | null {
  // First try ID mapping
  if (plant.id && PLANT_ID_MAP[plant.id]) {
    return PLANT_ID_MAP[plant.id];
  }
  
  // Then try name mapping
  const searchTerms = [
    plant.name?.toLowerCase(),
    plant.species?.toLowerCase(),
  ].filter(Boolean);
  
  for (const term of searchTerms) {
    if (term && PLANT_IMAGE_MAP[term]) {
      return PLANT_IMAGE_MAP[term];
    }
    
    // Check for partial matches
    if (term) {
      for (const [key, imagePath] of Object.entries(PLANT_IMAGE_MAP)) {
        if (term.includes(key) || key.includes(term)) {
          return imagePath;
        }
      }
    }
  }
  
  return null;
}

/**
 * Get fallback plant icon based on category
 */
export function getPlantFallbackIcon(category?: string): string {
  switch (category?.toLowerCase()) {
    case 'fern':
      return '/images/plants/boston_fern.jpg';
    case 'palm':
      return '/images/plants/parlor_palm.jpg';
    case 'dracaena':
      return '/images/plants/dracaena.jpg';
    case 'cactus and succulent':
      return '/images/plants/aloe_vera.jpg';
    case 'hanging':
      return '/images/plants/pothos.jpg';
    default:
      return '/images/plants/monstera.jpg'; // Default fallback
  }
}
