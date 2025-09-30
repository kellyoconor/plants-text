import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Droplets, Sun, Thermometer, Search, Leaf, Check, X, ArrowLeft } from 'lucide-react';
import { getPlantCatalog, addPlantToUser, suggestPersonality } from '../api';
import { Plant } from '../types';
import { getPlantImage } from '../utils/plantImageMapping';

interface PlantCatalogProps {
  userId: number;
  onPlantAdded: () => void;
  onBack?: () => void;
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

const PlantCatalog: React.FC<PlantCatalogProps> = ({ userId, onPlantAdded, onBack }) => {
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
    fetchPlants();
  }, []);

  useEffect(() => {
    const filtered = filterPlants(plants, searchTerm);
    setFilteredPlants(filtered);
  }, [plants, searchTerm]);

  const filterPlants = (plants: Plant[], term: string) => {
    if (!term.trim()) {
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
        
        // Simple character substitution tolerance
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
      'Snake Plant', 'Pothos', 'Monstera', 'Rubber Plant', 'Peace Lily',
      'ZZ Plant', 'Fiddle Leaf Fig', 'Spider Plant', 'Aloe Vera', 'Jade Plant'
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

  const fetchPlants = async () => {
    try {
      const plantsData = await getPlantCatalog();
      setPlants(plantsData);
    } catch (error) {
      console.error('Failed to fetch plants:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'moderate':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'challenging':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getDifficultyLabel = (level: string) => {
    switch (level.toLowerCase()) {
      case 'easy':
        return 'Easy Care';
      case 'moderate':
        return 'Moderate';
      case 'challenging':
        return 'Challenging';
      default:
        return level;
    }
  };

  const togglePlantSelection = (plant: Plant) => {
    setSelectedPlants(prev => {
      if (prev.some(p => p.id === plant.id)) {
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
        plant_catalog_id: plantToAdd.id,
        nickname: nickname.trim()
      });
      
      onPlantAdded();
      setShowAddForm(false);
      setPlantToAdd(null);
      setNickname('');
      setPersonalitySuggestion(null);
    } catch (error) {
      console.error('Failed to add plant:', error);
      alert('Failed to add plant. Please try again.');
    } finally {
      setAddingPlant(false);
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
    <div className="min-h-screen bg-white p-4 py-12">
      {/* Subtle floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-50 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-emerald-50 rounded-full opacity-25 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-teal-50 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
      
      <div className="max-w-4xl w-full mx-auto relative">
          <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center overflow-hidden">
            {/* Back button in top-left */}
            {onBack && (
              <button
                onClick={onBack}
                className="absolute top-4 left-4 z-20 group flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span className="text-sm font-medium font-body">Back</span>
              </button>
            )}
            
            {/* Subtle background accents */}
            <div className="absolute top-4 right-4 w-8 h-8 bg-green-50 rounded-full opacity-40"></div>
            <div className="absolute bottom-6 left-4 w-6 h-6 bg-emerald-50 rounded-full opacity-30"></div>
            <div className="absolute top-1/2 right-8 w-4 h-4 bg-teal-50 rounded-full opacity-25"></div>
            
            {/* Header */}
            <div className="mb-8 relative z-10 mt-4">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              
              <h2 className="text-4xl font-bold text-green-800 mb-6 font-body tracking-tight">Plant Catalog</h2>
            </div>

            {/* Search Bar */}
            <div className="mb-8 relative z-10">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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
                  placeholder="Search plants (e.g., Snake Plant, Monstera)"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white/50 font-body"
                />
          
                {/* Autocomplete Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 focus:bg-green-50 focus:outline-none first:rounded-t-2xl last:rounded-b-2xl font-body transition-colors duration-200"
                      >
                        <span className="text-gray-900">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {searchTerm && filteredPlants.length === 0 && (
                <div className="text-center mt-6 p-6 relative z-10">
                  <p className="text-gray-400 font-body">No results for "{searchTerm}"</p>
                </div>
              )}
              {searchTerm && filteredPlants.length > 0 && (
                <p className="text-center text-sm text-gray-500 mt-4 font-body relative z-10">
                  Found {filteredPlants.length} plants matching "{searchTerm}"
                </p>
              )}
            </div>

            {/* Selected Plants Tray */}
            {selectedPlants.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-green-900 text-sm sm:text-base font-body">Your Selected Plants ({selectedPlants.length})</h3>
                  <button
                    onClick={() => setSelectedPlants([])}
                    className="text-green-700 hover:text-green-900 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded-lg px-3 py-2 font-body transition-colors duration-200"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedPlants.map((plant) => (
                    <div
                      key={plant.id}
                      className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 border border-green-200 shadow-sm"
                    >
                      <span className="text-sm font-medium text-gray-900 font-body">{plant.name}</span>
                      <button
                        onClick={() => togglePlantSelection(plant)}
                        className="text-green-600 hover:text-green-800 focus:outline-none transition-colors duration-200"
                        aria-label={`Remove ${plant.name} from selection`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plant Grid */}
            <div className="relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlants.map((plant) => {
                  const isSelected = isPlantSelected(plant);
                  return (
                    <div
                      key={plant.id}
                      className={`bg-white rounded-2xl shadow-lg border transition-all duration-200 overflow-hidden group hover:shadow-xl hover:scale-[1.02] ${
                        isSelected 
                          ? 'border-green-500 ring-2 ring-green-200 shadow-xl' 
                          : 'border-gray-100 hover:border-green-300'
                      }`}
                    >
                      {/* Plant Image */}
                      <div className="relative h-32 w-full">
                        <PlantImage 
                          plant={plant} 
                          className="w-full h-full rounded-t-2xl"
                        />
                        {/* Selection Checkbox */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlantSelection(plant);
                          }}
                          aria-label={isSelected ? `Remove ${plant.name} from selection` : `Add ${plant.name} to selection`}
                          className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-sm ${
                            isSelected
                            ? 'bg-green-500 border-green-500 text-white shadow-md'
                            : 'bg-white/90 backdrop-blur-sm border-gray-300 hover:border-green-400 group-hover:border-green-400 hover:bg-white'
                        }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      </div>
                  
                      <div className="p-4">
                        {/* Plant Name & Difficulty Badge */}
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-gray-900 truncate font-body">{plant.name}</h3>
                            <p className="text-xs text-gray-500 italic font-body">{plant.species}</p>
                          </div>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(plant.difficulty_level)} font-body`}>
                            {getDifficultyLabel(plant.difficulty_level)}
                          </span>
                        </div>
                      
                        {/* Care Requirements */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Droplets className="w-3 h-3 text-blue-500" />
                            <span className="font-body">Every {plant.care_requirements.watering_frequency_days} days</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Sun className="w-3 h-3 text-yellow-500" />
                            <span className="font-body">{plant.care_requirements.light_level} light</span>
                          </div>
                        </div>

                        {/* Add Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddPlantClick(plant);
                          }}
                          aria-label={`Add ${plant.name} to your collection`}
                          className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:shadow-lg active:scale-[0.98] font-body"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-xs">Add Plant</span>
                        </button>
                      </div>
                  </div>
              );
            })}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default PlantCatalog;