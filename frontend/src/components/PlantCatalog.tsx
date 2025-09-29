import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, Droplets, Sun, Thermometer, Search } from 'lucide-react';
import { getPlantCatalog, addPlantToUser, suggestPersonality } from '../api';
import { Plant } from '../types';

interface PlantCatalogProps {
  userId: number;
  onPlantAdded: () => void;
}

const PlantCatalog: React.FC<PlantCatalogProps> = ({ userId, onPlantAdded }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [addingPlant, setAddingPlant] = useState(false);
  const [nickname, setNickname] = useState('');
  const [personalitySuggestion, setPersonalitySuggestion] = useState<any>(null);

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    // Filter plants based on search term
    if (searchTerm.trim() === '') {
      setFilteredPlants(plants.slice(0, 20)); // Show first 20 plants by default
    } else {
      const filtered = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.species.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlants(filtered);
    }
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

  const handleSelectPlant = async (plant: Plant) => {
    setSelectedPlant(plant);
    setNickname('');
    
    // Get personality suggestion
    try {
      const suggestion = await suggestPersonality(plant.id);
      setPersonalitySuggestion(suggestion);
    } catch (error) {
      console.error('Failed to get personality suggestion:', error);
    }
  };

  const handleAddPlant = async () => {
    if (!selectedPlant || !nickname.trim()) return;

    setAddingPlant(true);
    try {
      await addPlantToUser({
        user_id: userId,
        nickname: nickname.trim(),
        plant_catalog_id: selectedPlant.id,
      });
      
      setSelectedPlant(null);
      setNickname('');
      setPersonalitySuggestion(null);
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
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
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
        <p className="mt-2 text-gray-600">Choose a plant to add to your collection</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search plants... (e.g., Snake Plant, Monstera)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        {searchTerm && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Found {filteredPlants.length} plants matching "{searchTerm}"
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plant Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => handleSelectPlant(plant)}
                className={`bg-white rounded-lg shadow-sm border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedPlant?.id === plant.id 
                    ? 'border-green-500 ring-2 ring-green-200' 
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{plant.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(plant.difficulty_level)}`}>
                      {plant.difficulty_level}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 italic mb-3">{plant.species}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Droplets className="w-4 h-4" />
                      <span>Every {plant.care_requirements.watering_frequency_days} days</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Sun className="w-4 h-4" />
                      <span>{plant.care_requirements.light_level} light</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Thermometer className="w-4 h-4" />
                      <span>{plant.care_requirements.ideal_temp_min}°-{plant.care_requirements.ideal_temp_max}°C</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Plant Details & Add Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            {selectedPlant ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedPlant.name}</h3>
                  <p className="text-gray-600 italic">{selectedPlant.species}</p>
                  <p className="text-sm text-gray-500 mt-2">{selectedPlant.description}</p>
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

                  <button
                    onClick={handleAddPlant}
                    disabled={!nickname.trim() || addingPlant}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
                  >
                    {addingPlant ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add to My Plants</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Select a plant to see details and add it to your collection</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantCatalog;
