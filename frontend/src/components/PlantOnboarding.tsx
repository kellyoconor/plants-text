import React, { useState, useEffect } from 'react';
import { Search, Check, Leaf, Phone, MessageCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { getPlantCatalog, addPlantToUser, findOrCreateUser } from '../api';
import { Plant, User } from '../types';
import { getPlantImage } from '../utils/plantImageMapping';

interface PlantOnboardingProps {
  onComplete: (user: User) => void;
}

// Back Button Component
const BackButton: React.FC<{ onClick: () => void; show: boolean }> = ({ onClick, show }) => {
  if (!show) return null;
  
  return (
    <button
      onClick={onClick}
      className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
      <span className="font-medium">Back</span>
    </button>
  );
};

// Progress Steps Component  
const ProgressSteps: React.FC<{ currentStep: string; onBack?: () => void }> = ({ currentStep, onBack }) => {
  const steps = [
    { key: 'welcome', label: 'Welcome', icon: Leaf },
    { key: 'phone', label: 'Phone Number', icon: Phone },
    { key: 'plants', label: 'Add Plants', icon: Search },
    { key: 'complete', label: 'Start Chatting', icon: MessageCircle }
  ];

  const getStepIndex = (stepKey: string) => steps.findIndex(s => s.key === stepKey);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <BackButton onClick={onBack || (() => {})} show={currentIndex > 0 && !!onBack} />
      
      {/* Combined Progress Label and Bar */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 font-body mb-3">
          <span>Step {currentIndex + 1} of {steps.length}</span>
          <span>•</span>
          <span className="text-green-600 font-medium">{steps[currentIndex]?.label}</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;

          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center relative">
                <div className={`
                  w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300
                  ${isActive ? 'bg-green-600 border-green-600 text-white shadow-md' : 
                    isCompleted ? 'bg-green-100 border-green-400 text-green-600' : 
                    'bg-gray-50 border-gray-200 text-gray-300'}
                `}>
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  flex-1 h-px mx-3 transition-colors duration-300
                  ${index < currentIndex ? 'bg-green-400' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

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
      const user = await findOrCreateUser({ phone: phone.trim() });
      setUser(user);
      setStep('plants');
    } catch (error) {
      console.error('Failed to find or create user:', error);
      alert('Failed to set up account. Please try again.');
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

  const handleBack = () => {
    if (step === 'phone') {
      setStep('welcome');
      // Clear phone input when going back to welcome
      setPhone('');
      setUser(null);
    } else if (step === 'plants') {
      setStep('phone');
      // Clear plant search when going back to phone
      setSearchTerm('');
      setSelectedPlant(null);
      setCurrentNickname('');
    } else if (step === 'complete') {
      setStep('plants');
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-4 py-12">
        {/* Subtle floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-50 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-emerald-50 rounded-full opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-teal-50 rounded-full opacity-20 animate-pulse delay-500"></div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 pt-6 text-center overflow-hidden">
              {/* Subtle background accents */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-green-50 rounded-full opacity-40"></div>
              <div className="absolute bottom-6 left-4 w-6 h-6 bg-emerald-50 rounded-full opacity-30"></div>
              <div className="absolute top-1/2 right-8 w-4 h-4 bg-teal-50 rounded-full opacity-25"></div>
              
              {/* Branding & Hero */}
              <div className="mb-3 relative z-10">
                {/* Logo treatment */}
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                
                <h1 className="text-4xl font-bold text-green-800 mb-2 font-body tracking-tight">
                  PlantTexts
                </h1>
                <p className="text-lg font-body font-medium text-gray-700 mb-2 leading-relaxed">
                  Chat with your plants.<br />Keep them happy.
                </p>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 font-body">
                  Get care reminders and have conversations with your plants — each with their own unique personality.
                </p>
              </div>
              
              {/* Friendly Steps List */}
              <div className="mb-5 relative z-10">
                <h3 className="text-xs font-medium text-gray-500 mb-4 font-body uppercase tracking-wider">What happens next</h3>
                <div className="space-y-8 text-left">
                  <div className="flex items-center space-x-4 animate-fade-in">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm font-body mb-0.5">Share your number</p>
                      <p className="text-xs text-gray-500 font-body">We'll send you gentle plant care reminders</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 animate-fade-in delay-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm font-body mb-0.5">Add your plants</p>
                      <p className="text-xs text-gray-500 font-body">Give them names and fun personalities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 animate-fade-in delay-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm font-body mb-0.5">Start chatting</p>
                      <p className="text-xs text-gray-500 font-body">Have real conversations with your plant friends</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* CTA Section */}
              <div className="border-t border-gray-100 pt-5 mt-3">
                <button
                  onClick={() => setStep('phone')}
                  className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 px-6 rounded-2xl font-medium text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 mb-3 font-body"
                >
                  Start Growing
                </button>
                
                {/* Reassurance text */}
                <p className="text-xs text-gray-400 font-body text-center">Takes about 2 minutes</p>
              </div>
            </div>
            
            {/* Progress indicator positioned closer to card */}
            <div className="mt-4">
              <ProgressSteps currentStep={step} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-4 py-12">
        {/* Subtle floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-50 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-emerald-50 rounded-full opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-teal-50 rounded-full opacity-20 animate-pulse delay-500"></div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <ProgressSteps currentStep={step} onBack={handleBack} />
          <div className="max-w-md w-full mx-auto">
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                What's your phone number?
              </h2>
              <p className="text-gray-600">Your plants will send you care reminders and messages here</p>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white/50"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              
              <button
                onClick={handlePhoneSubmit}
                disabled={!phone.trim() || loading}
                className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <span className="relative">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Creating your garden...</span>
                    </div>
                  ) : (
                    'Continue'
                  )}
                </span>
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  🔒 Your number is secure and only used for plant messages
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (step === 'plants') {
    return (
      <div className="min-h-screen bg-white p-4 py-8">
        {/* Subtle floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-50 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-emerald-50 rounded-full opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-teal-50 rounded-full opacity-20 animate-pulse delay-500"></div>
        </div>
        
        <ProgressSteps currentStep={step} onBack={handleBack} />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">What plants do you have?</h2>
            <p className="text-gray-600">Search for your plants and give them names</p>
          </div>

          {/* Added Plants */}
          {addedPlants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plant Family ({addedPlants.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {addedPlants.map((item, index) => {
                  const imageUrl = getPlantImage(item.plant);
                  return (
                    <div key={index} className="bg-white rounded-2xl overflow-hidden border-2 border-green-200 shadow-lg">
                      {/* Small plant image */}
                      <div className="h-20 w-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.plant.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                          <Leaf className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center space-x-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{item.nickname}</h4>
                            <p className="text-sm text-gray-600">{item.plant.name}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search and Add Plant */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mb-8">
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
                    {filteredPlants.map((plant) => {
                      const imageUrl = getPlantImage(plant);
                      return (
                        <div
                          key={plant.id}
                          onClick={() => handleSelectPlant(plant)}
                          className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-green-300 hover:shadow-md transition-all"
                        >
                          {/* Plant Image */}
                          <div className="h-32 w-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={plant.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`flex items-center justify-center ${imageUrl ? 'hidden' : ''}`}>
                              <Leaf className="w-8 h-8 text-green-500" />
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <h3 className="font-semibold text-gray-900">{plant.name}</h3>
                            <p className="text-sm text-gray-600 italic">{plant.species}</p>
                            <div className="mt-2">
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {plant.difficulty_level} care
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                <div className="border border-green-200 rounded-lg overflow-hidden mb-4 bg-green-50">
                  {/* Selected Plant Image */}
                  <div className="h-40 w-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
                    {(() => {
                      const imageUrl = getPlantImage(selectedPlant);
                      return imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={selectedPlant.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : (
                        <Leaf className="w-12 h-12 text-green-500" />
                      );
                    })()}
                    <div className="hidden flex items-center justify-center">
                      <Leaf className="w-12 h-12 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{selectedPlant.name}</h3>
                    <p className="text-sm text-gray-600 italic">{selectedPlant.species}</p>
                  </div>
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
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
                <button
                  onClick={handleComplete}
                  className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <span className="relative flex items-center justify-center space-x-2">
                    <span>Start Getting Messages!</span>
                    <span className="px-2 py-1 bg-white/20 rounded-lg text-sm">
                      {addedPlants.length} plant{addedPlants.length !== 1 ? 's' : ''}
                    </span>
                  </span>
                </button>
              
                {!selectedPlant && (
                  <p className="text-gray-500 text-sm mt-4">
                    Or search to add more plants
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-4 py-12">
        {/* Subtle floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-green-50 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-emerald-50 rounded-full opacity-25 animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-teal-50 rounded-full opacity-20 animate-pulse delay-500"></div>
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <ProgressSteps currentStep={step} onBack={handleBack} />
          <div className="max-w-md w-full mx-auto relative z-10">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center">
            <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
            <p className="text-gray-600 mb-4">
              Your plants are ready to chat! You can now start conversations with them right here in the app.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-700 text-sm">
                💬 <strong>Coming Soon:</strong> Your plants will also send you care reminders and messages directly to {phone} via text!
              </p>
            </div>
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
        </div>
      </div>
    );
  }

  return null;
};

export default PlantOnboarding;
