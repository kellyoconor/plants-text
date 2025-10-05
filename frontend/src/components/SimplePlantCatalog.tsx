import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Leaf, Check } from 'lucide-react';
import { getPlantCatalog, addPlantToUser } from '../api';
import { Plant } from '../types';
import { getPlantImage } from '../utils/plantImageMapping';
import { messages, getLoadingMessage } from '../utils/messages';

interface SimplePlantCatalogProps {
  userId: number;
  onPlantAdded: () => void;
  onBack?: () => void;
}

const SimplePlantCatalog: React.FC<SimplePlantCatalogProps> = ({ userId, onPlantAdded, onBack }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlants([]);
    } else {
      const filtered = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.species.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlants(filtered.slice(0, 8));
    }
  }, [searchTerm, plants]);

  const loadPlants = async () => {
    try {
      const plantData = await getPlantCatalog();
      setPlants(plantData);
    } catch (error) {
      console.error('Failed to load plants:', error);
    }
  };

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlant(plant);
    setNickname('');
    setSearchTerm('');
  };

  const handleAddPlant = async () => {
    if (!selectedPlant || !nickname.trim()) return;

    setError('');
    setLoading(true);
    try {
      await addPlantToUser({
        user_id: userId,
        nickname: nickname.trim(),
        plant_catalog_id: selectedPlant.id,
      });
      
      // Success! Go back to dashboard
      onPlantAdded();
    } catch (error) {
      console.error('Failed to add plant:', error);
      setError(messages.errors.addPlantFailed.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 py-8">
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8 relative">
          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="absolute top-0 left-0 group flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="text-sm font-medium font-body">Back</span>
            </button>
          )}
          
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
            <Leaf className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-green-800 mb-2 font-body tracking-tight">
            Add a New Plant
          </h2>
          <p className="text-gray-600 font-body">
            Search for your plant and give it a name
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mb-6">
          {!selectedPlant ? (
            <>
              {/* Search Box */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for a plant (e.g., Snake Plant, Monstera)"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base font-body transition-all duration-200"
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchTerm.trim() && (
                <div>
                  <p className="text-sm text-gray-500 mb-4 font-body">
                    Found {filteredPlants.length} plant{filteredPlants.length !== 1 ? 's' : ''} matching "{searchTerm}"
                  </p>
                  
                  {filteredPlants.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredPlants.map((plant) => {
                        const plantImage = getPlantImage(plant);
                        return (
                          <button
                            key={plant.id}
                            onClick={() => handleSelectPlant(plant)}
                            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {plantImage ? (
                                  <img 
                                    src={plantImage} 
                                    alt={plant.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Leaf className="w-8 h-8 text-green-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 font-body mb-1 group-hover:text-green-700 transition-colors">
                                  {plant.name}
                                </h3>
                                <p className="text-sm text-gray-500 font-body truncate">
                                  {plant.species}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 font-body">
                                    {plant.difficulty_level}
                                  </span>
                                </div>
                              </div>
                              <div className="text-gray-300 group-hover:text-green-500 transition-colors">
                                <ArrowLeft className="w-5 h-5 rotate-180" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-700 font-medium font-body mb-1">
                        No matches for "{searchTerm}"
                      </p>
                      <p className="text-sm text-gray-500 font-body">
                        Try another name or browse our suggestions above
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Initial State */}
              {!searchTerm.trim() && (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 font-body">
                    Search for your plant
                  </h3>
                  <p className="text-gray-500 font-body">
                    Start typing to find your plant in our catalog
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {['Snake Plant', 'Monstera', 'Pothos', 'Peace Lily'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchTerm(suggestion)}
                        className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-full text-sm font-medium font-body transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Selected Plant - Give it a nickname
            <div>
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-10 h-10 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 font-body mb-1">
                      {selectedPlant.name}
                    </h3>
                    <p className="text-gray-600 font-body">
                      {selectedPlant.species}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 font-body">
                        {selectedPlant.difficulty_level}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPlant(null);
                      setNickname('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Nickname Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
                  Give your plant a name
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && nickname.trim()) {
                      handleAddPlant();
                    }
                  }}
                  placeholder="e.g., Sneaky Steve, Monstera Lisa"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base font-body transition-all duration-200"
                  autoFocus
                />
                <p className="mt-2 text-sm text-gray-500 font-body">
                  Give it a fun name! Your plant will introduce itself with this name.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-700 font-body">{error}</p>
                </div>
              )}

              {/* Add Button */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedPlant(null);
                    setNickname('');
                  }}
                  className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-all duration-200 font-body"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlant}
                  disabled={!nickname.trim() || loading}
                  className="flex-1 py-4 px-6 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 transition-all duration-200 font-body flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>{getLoadingMessage('addingPlant')}</span>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Add Plant</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimplePlantCatalog;

