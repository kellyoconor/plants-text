import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Droplets, Sun, Thermometer, Search, Leaf, Check, X } from 'lucide-react';
import { getPlantCatalog, addPlantToUser, suggestPersonality } from '../api';
import { Plant } from '../types';
import { getPlantImage } from '../utils/plantImageMapping';

interface PlantCatalogProps {
  userId: number;
  onPlantAdded: () => void;
}

// Plant Image Component
const PlantImage: React.FC<{ plant: Plant; className?: string }> = ({ plant, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getPlantImage(plant);

  if (!imageUrl || imageError) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center ${className}`}>
        <Leaf className="w-8 h-8 text-green-500" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={plant.name}
      className={`object-cover ${className}`}
      onError={() => setImageError(true)}
      loading="lazy"
    />
  );
};

const PlantCatalog: React.FC<PlantCatalogProps> = ({ userId, onPlantAdded }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlants, setSelectedPlants] = useState<Plant[]>([]);
  const [addingPlant, setAddingPlant] = useState(false);
  const [nickname, setNickname] = useState('');
  const [personalitySuggestion, setPersonalitySuggestion] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [plantToAdd, setPlantToAdd] = useState<Plant | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadPlants();
  }, []);

  // Enhanced search with synonyms and fuzzy matching
  const searchPlants = (term: string) => {
    if (term.trim() === '') {
      return plants.slice(0, 20); // Show first 20 plants by default
    }

    const searchTerm = term.toLowerCase().trim();
    
    // Common plant synonyms and alternate names
    const synonyms: Record<string, string[]> = {
      'snake plant': ['sansevieria', 'mother-in-law\'s tongue', 'viper\'s bowstring hemp'],
      'pothos': ['devil\'s ivy', 'golden pothos', 'money plant', 'ivy arum'],
      'rubber plant': ['rubber tree', 'ficus elastica', 'indian rubber bush'],
      'zz plant': ['zamioculcas', 'zanzibar gem', 'zuzu plant'],
      'peace lily': ['spathiphyllum', 'white sails'],
      'monstera': ['swiss cheese plant', 'split-leaf philodendron'],
      'jade plant': ['crassula ovata', 'money tree', 'friendship tree'],
      'spider plant': ['chlorophytum comosum', 'airplane plant', 'ribbon plant'],
      'aloe': ['aloe vera', 'burn plant', 'medicine plant'],
      'fiddle leaf fig': ['ficus lyrata', 'banjo fig'],
      'bird of paradise': ['strelitzia', 'crane flower'],
      'chinese evergreen': ['aglaonema', 'philippine evergreen'],
      'dracaena': ['dragon tree', 'madagascar dragon tree', 'corn plant'],
    };

    return plants.filter(plant => {
      const plantName = plant.name.toLowerCase();
      const plantSpecies = plant.species.toLowerCase();
      
      // Direct name/species match
      if (plantName.includes(searchTerm) || plantSpecies.includes(searchTerm)) {
        return true;
      }

      // Check synonyms
      for (const [key, syns] of Object.entries(synonyms)) {
        if (plantName.includes(key) || key.includes(plantName)) {
          if (syns.some(syn => syn.includes(searchTerm) || searchTerm.includes(syn))) {
            return true;
          }
        }
      }

      // Fuzzy matching for common typos
      const fuzzyMatch = (str: string, search: string) => {
        if (search.length < 3) return false;
        
        // Simple Levenshtein-like matching for small typos
        let matches = 0;
        const minLength = Math.min(str.length, search.length);
        
        for (let i = 0; i < minLength; i++) {
          if (str[i] === search[i]) matches++;
        }
        
        return matches / minLength > 0.6; // 60% character match
      };

      return fuzzyMatch(plantName, searchTerm) || fuzzyMatch(plantSpecies, searchTerm);
    });
  };

  // Generate search suggestions
  const generateSuggestions = (term: string) => {
    if (term.length < 2) return [];
    
    const suggestions = new Set<string>();
    const termLower = term.toLowerCase();
    
    // Add plant names that start with or contain the search term
    plants.forEach(plant => {
      const name = plant.name.toLowerCase();
      if (name.includes(termLower)) {
        suggestions.add(plant.name);
      }
    });
    
    // Add common synonyms
    const commonNames = [
      'Snake Plant', 'Pothos', 'Rubber Plant', 'ZZ Plant', 'Peace Lily',
      'Monstera', 'Jade Plant', 'Spider Plant', 'Aloe Vera', 'Fiddle Leaf Fig',
      'Bird of Paradise', 'Chinese Evergreen', 'Dracaena', 'Sansevieria',
      'Devil\'s Ivy', 'Mother-in-law\'s Tongue', 'Swiss Cheese Plant'
    ];
    
    commonNames.forEach(name => {
      if (name.toLowerCase().includes(termLower)) {
        suggestions.add(name);
      }
    });
    
    return Array.from(suggestions).slice(0, 5); // Limit to 5 suggestions
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    const suggestions = generateSuggestions(value);
    setSearchSuggestions(suggestions);
    setShowSuggestions(value.length > 1 && suggestions.length > 0);
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setSearchSuggestions([]);
  };

  // Group similar plants to reduce duplicates
  const groupPlants = (plantList: Plant[]) => {
    const groups: Record<string, Plant[]> = {};
    const ungrouped: Plant[] = [];
    
    plantList.forEach(plant => {
      const name = plant.name.toLowerCase();
      
      // Define grouping patterns
      if (name.includes('rubber') && (name.includes('plant') || name.includes('tree'))) {
        if (!groups['Rubber Plants']) groups['Rubber Plants'] = [];
        groups['Rubber Plants'].push(plant);
      } else if (name.includes('pothos')) {
        if (!groups['Pothos Varieties']) groups['Pothos Varieties'] = [];
        groups['Pothos Varieties'].push(plant);
      } else if (name.includes('palm')) {
        if (!groups['Palm Plants']) groups['Palm Plants'] = [];
        groups['Palm Plants'].push(plant);
      } else if (name.includes('fern')) {
        if (!groups['Ferns']) groups['Ferns'] = [];
        groups['Ferns'].push(plant);
      } else if (name.includes('snake plant') || name.includes('sansevieria')) {
        if (!groups['Snake Plants']) groups['Snake Plants'] = [];
        groups['Snake Plants'].push(plant);
      } else {
        ungrouped.push(plant);
      }
    });
    
    // Convert groups to representative plants (show the most common/popular one)
    const groupedPlants: Plant[] = [];
    
    Object.entries(groups).forEach(([groupName, plants]) => {
      if (plants.length > 1) {
        // Pick the most generic/common name as representative
        const representative = plants.find(p => 
          !p.name.toLowerCase().includes('variegated') &&
          !p.name.toLowerCase().includes('dwarf') &&
          !p.name.toLowerCase().includes('mini')
        ) || plants[0];
        
        // Mark as grouped and add count
        groupedPlants.push({
          ...representative,
          name: `${groupName} (${plants.length} varieties)`,
          id: representative.id, // Keep original ID for adding
        });
      } else {
        groupedPlants.push(plants[0]);
      }
    });
    
    return [...ungrouped, ...groupedPlants];
  };

  useEffect(() => {
    const searchResults = searchPlants(searchTerm);
    const grouped = groupPlants(searchResults);
    setFilteredPlants(grouped);
  }, [searchTerm, plants]);

  const loadPlants = async () => {
    try {
      const plantData = await getPlantCatalog();
      setPlants(plantData);
    } catch (error) {
      console.error('Failed to load plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePlantSelection = (plant: Plant) => {
    setSelectedPlants(prev => {
      const isSelected = prev.some(p => p.id === plant.id);
      if (isSelected) {
        return prev.filter(p => p.id !== plant.id);
      } else {
        return [...prev, plant];
      }
    });
  };

  const isPlantSelected = (plant: Plant) => {
    return selectedPlants.some(p => p.id === plant.id);
  };

  const handleAddPlantClick = async (plant: Plant) => {
    setPlantToAdd(plant);
    setNickname('');
    setShowAddForm(true);
    
    // Get personality suggestion
    try {
      const suggestion = await suggestPersonality(plant.id);
      setPersonalitySuggestion(suggestion);
    } catch (error) {
      console.error('Failed to get personality suggestion:', error);
    }
  };

  const handleAddPlant = async () => {
    if (!plantToAdd || !nickname.trim()) return;

    setAddingPlant(true);
    try {
      await addPlantToUser({
        user_id: userId,
        nickname: nickname.trim(),
        plant_catalog_id: plantToAdd.id,
      });
      
      setPlantToAdd(null);
      setNickname('');
      setPersonalitySuggestion(null);
      setShowAddForm(false);
      onPlantAdded();
      
      alert(`${nickname} has been added to your collection! 🌱`);
    } catch (error) {
      console.error('Failed to add plant:', error);
      alert('Failed to add plant. Please try again.');
    } finally {
      setAddingPlant(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-700 bg-green-100 border-green-200';
      case 'medium': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'hard': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy Care';
      case 'medium': return 'Moderate';
      case 'hard': return 'Challenging';
      default: return difficulty;
    }
  };

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'dramatic': return 'text-purple-600 bg-purple-100';
      case 'sarcastic': return 'text-blue-600 bg-blue-100';
      case 'chill': return 'text-green-600 bg-green-100';
      case 'chatty': return 'text-orange-600 bg-orange-100';
      case 'zen': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Plant Catalog</h2>
        <p className="mt-2 text-gray-600">Choose plants to add to your collection</p>
        <p className="text-sm text-gray-500 mt-1">You can always edit or add more plants later.</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto px-4 sm:px-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (searchTerm.length > 1) {
                setShowSuggestions(searchSuggestions.length > 0);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => setShowSuggestions(false), 150);
            }}
            placeholder="Search plants... (e.g., Snake Plant, Monstera)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          
          {/* Autocomplete Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => selectSuggestion(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {searchTerm && filteredPlants.length === 0 && (
          <div className="text-center mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No plants found matching "{searchTerm}"</p>
            <p className="text-sm text-gray-500 mt-1">Try another name or check spelling</p>
          </div>
        )}
        {searchTerm && filteredPlants.length > 0 && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Found {filteredPlants.length} plants matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Selected Plants Tray */}
      {selectedPlants.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 mx-4 sm:mx-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-green-900 text-sm sm:text-base">Your Selected Plants ({selectedPlants.length})</h3>
            <button
              onClick={() => setSelectedPlants([])}
              className="text-green-700 hover:text-green-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded px-2 py-1"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPlants.map((plant) => (
              <div
                key={plant.id}
                className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 border border-green-200"
              >
                <span className="text-sm font-medium text-gray-900">{plant.name}</span>
                <button
                  onClick={() => togglePlantSelection(plant)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPlants.map((plant) => {
              const isSelected = isPlantSelected(plant);
              return (
                <div
                  key={plant.id}
                  className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 overflow-hidden group hover:shadow-lg hover:scale-[1.02] ${
                    isSelected 
                      ? 'border-green-500 ring-2 ring-green-200 shadow-md' 
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  {/* Plant Image */}
                  <div className="relative h-48 w-full">
                    <PlantImage 
                      plant={plant} 
                      className="w-full h-full rounded-t-xl"
                    />
                    {/* Selection Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlantSelection(plant);
                      }}
                      aria-label={isSelected ? `Remove ${plant.name} from selection` : `Add ${plant.name} to selection`}
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        isSelected
                          ? 'bg-green-500 border-green-500 text-white shadow-md'
                          : 'bg-white/90 backdrop-blur-sm border-gray-300 hover:border-green-400 group-hover:border-green-400 hover:bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  <div className="p-5">
                    {/* Plant Name & Difficulty Badge */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">{plant.name}</h3>
                        <p className="text-sm text-gray-500 italic mt-1">{plant.species}</p>
                      </div>
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(plant.difficulty_level)}`}>
                        {getDifficultyLabel(plant.difficulty_level)}
                      </span>
                    </div>
                    
                    {/* Care Requirements */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Droplets className="w-4 h-4 text-blue-500" />
                        <span>Every {plant.care_requirements.watering_frequency_days} days</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <span>{plant.care_requirements.light_level} light</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Thermometer className="w-4 h-4 text-red-500" />
                        <span>{plant.care_requirements.ideal_temp_min}°-{plant.care_requirements.ideal_temp_max}°C</span>
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddPlantClick(plant);
                      }}
                      aria-label={`Add ${plant.name} to your collection`}
                      className="w-full bg-green-600 hover:bg-green-700 focus:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:shadow-md active:scale-[0.98]"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Add Plant</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plant Details & Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-4 mx-4 sm:mx-0">
            {showAddForm && plantToAdd ? (
              <div className="space-y-4">
                {/* Selected Plant Image */}
                <div className="h-48 w-full rounded-lg overflow-hidden">
                  <PlantImage 
                    plant={plantToAdd} 
                    className="w-full h-full rounded-lg"
                  />
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{plantToAdd.name}</h3>
                  <p className="text-gray-600 italic">{plantToAdd.species}</p>
                  <p className="text-sm text-gray-500 mt-2">{plantToAdd.description}</p>
                </div>

                {personalitySuggestion && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">Personality Match</h4>
                    </div>
                    <div className="space-y-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPersonalityColor(personalitySuggestion.suggested_personality)}`}>
                        {personalitySuggestion.suggested_personality}
                      </span>
                      <p className="text-sm text-purple-700">{personalitySuggestion.explanation}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Give your plant a name
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g., Fernando, Drama Queen, Zen Master"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setPlantToAdd(null);
                        setPersonalitySuggestion(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddPlant}
                      disabled={!nickname.trim() || addingPlant}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      {addingPlant ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add Plant</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to add plants?</h3>
                <p className="text-gray-500 text-sm mb-4">Click "Add Plant" on any card to get started</p>
                {selectedPlants.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-green-700 text-sm font-medium">
                      {selectedPlants.length} plant{selectedPlants.length > 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantCatalog;
