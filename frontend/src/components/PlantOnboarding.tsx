import React, { useState, useEffect } from 'react';
import { Search, Check, Leaf } from 'lucide-react';
import { getPlantCatalog, addPlantToUser, createUser } from '../api';
import { Plant, User } from '../types';

interface PlantOnboardingProps {
  onComplete: (user: User) => void;
}

const PlantOnboarding: React.FC<PlantOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'welcome' | 'phone' | 'plants' | 'complete'>('welcome');
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addedPlants, setAddedPlants] = useState<{plant: Plant, nickname: string}[]>([]);
  const [currentNickname, setCurrentNickname] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 'plants') {
      loadPlants();
    }
  }, [step]);

  useEffect(() => {
    // Filter plants based on search term
    if (searchTerm.trim() === '') {
      setFilteredPlants([]);
    } else {
      const filtered = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.species.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlants(filtered.slice(0, 8)); // Show max 8 results
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

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) return;
    
    setLoading(true);
    try {
      const newUser = await createUser({ phone: phone.trim() });
      setUser(newUser);
      setStep('plants');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlant = (plant: Plant) => {
    setSelectedPlant(plant);
    setCurrentNickname('');
    setSearchTerm('');
  };

  const handleAddPlant = async () => {
    if (!selectedPlant || !currentNickname.trim() || !user) return;

    setLoading(true);
    try {
      await addPlantToUser({
        user_id: user.id,
        nickname: currentNickname.trim(),
        plant_catalog_id: selectedPlant.id,
      });
      
      setAddedPlants(prev => [...prev, { plant: selectedPlant, nickname: currentNickname.trim() }]);
      setSelectedPlant(null);
      setCurrentNickname('');
    } catch (error) {
      console.error('Failed to add plant:', error);
      alert('Failed to add plant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (addedPlants.length === 0) {
      alert('Please add at least one plant to continue.');
      return;
    }
    setStep('complete');
    setTimeout(() => {
      if (user) onComplete(user);
    }, 2000);
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <Leaf className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PlantTexts!</h1>
            <p className="text-gray-600">Get personalized care reminders and chat with your plants via text message.</p>
          </div>
          
          <button
            onClick={() => setStep('phone')}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">What's your phone number?</h2>
            <p className="text-gray-600">We'll send your plant messages here</p>
          </div>
          
          <div className="space-y-4">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              autoFocus
            />
            
            <button
              onClick={handlePhoneSubmit}
              disabled={!phone.trim() || loading}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'plants') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">What plants do you have?</h2>
            <p className="text-gray-600">Search for your plants and give them names</p>
          </div>

          {/* Added Plants */}
          {addedPlants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plant Family ({addedPlants.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {addedPlants.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{item.nickname}</h4>
                        <p className="text-sm text-gray-600">{item.plant.name}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Add Plant */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            {!selectedPlant ? (
              <div>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for your plants... (e.g., Snake Plant, Monstera)"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                {filteredPlants.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredPlants.map((plant) => (
                      <div
                        key={plant.id}
                        onClick={() => handleSelectPlant(plant)}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-green-300 hover:bg-green-50 transition-all"
                      >
                        <h3 className="font-semibold text-gray-900">{plant.name}</h3>
                        <p className="text-sm text-gray-600 italic">{plant.species}</p>
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {plant.difficulty_level} care
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchTerm && filteredPlants.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No plants found for "{searchTerm}"</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="border border-green-200 rounded-lg p-4 mb-4 bg-green-50">
                  <h3 className="font-semibold text-gray-900">{selectedPlant.name}</h3>
                  <p className="text-sm text-gray-600 italic">{selectedPlant.species}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What do you call this plant?
                    </label>
                    <input
                      type="text"
                      value={currentNickname}
                      onChange={(e) => setCurrentNickname(e.target.value)}
                      placeholder="e.g., Fernanda, My Snake Plant, Green Friend"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddPlant}
                      disabled={!currentNickname.trim() || loading}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Adding...' : 'Add Plant'}
                    </button>
                    <button
                      onClick={() => setSelectedPlant(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Complete Button */}
          {addedPlants.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleComplete}
                className="bg-green-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Start Getting Messages! ({addedPlants.length} plant{addedPlants.length !== 1 ? 's' : ''})
              </button>
              
              {!selectedPlant && (
                <p className="text-gray-500 text-sm mt-2">
                  Or search to add more plants
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-gray-600 mb-4">
              Your plants will start sending you care reminders and messages at {phone}.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Your Plant Family:</h3>
              <div className="space-y-1">
                {addedPlants.map((item, index) => (
                  <p key={index} className="text-green-700 text-sm">
                    {item.nickname} ({item.plant.name})
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PlantOnboarding;
