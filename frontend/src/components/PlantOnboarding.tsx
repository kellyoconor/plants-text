import React, { useState, useEffect } from 'react';
import { Search, Check, Leaf, Phone, MessageCircle, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { getPlantCatalog, addPlantToUser, findOrCreateUser } from '../api';
import { Plant, User } from '../types';
import { getPlantImage } from '../utils/plantImageMapping';

interface PlantOnboardingProps {
  onComplete: (user: User) => void;
}


// Progress Steps Component  
const ProgressSteps: React.FC<{ currentStep: string }> = ({ currentStep }) => {
  const steps = [
    { key: 'welcome', label: 'Welcome', icon: Leaf, emoji: '🌱' },
    { key: 'phone', label: 'Phone Number', icon: Phone, emoji: '📱' },
    { key: 'plants', label: 'Add Plants', icon: Search, emoji: '🌿' },
    { key: 'complete', label: 'Start Chatting', icon: MessageCircle, emoji: '💬' }
  ];

  const getStepIndex = (stepKey: string) => steps.findIndex(s => s.key === stepKey);
  const currentIndex = getStepIndex(currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
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
                  ) : isActive ? (
                    <span className="text-sm">{step.emoji}</span>
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
  console.log('PlantOnboarding component mounted');
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
                
                <h1 className="text-4xl font-bold text-green-800 mb-3 font-body tracking-tight">
                  PlantTexts
                </h1>
                <p className="text-lg font-body font-medium text-gray-700 mb-5 leading-relaxed">
                  Chat with your plants. Keep them happy.
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
                      <p className="font-medium text-gray-800 text-sm font-body">Share your number</p>
                      <p className="text-xs text-gray-500 font-body">We'll send you gentle plant care reminders</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 animate-fade-in delay-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <Leaf className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm font-body">Add your plants</p>
                      <p className="text-xs text-gray-500 font-body">Give them names and fun personalities</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 animate-fade-in delay-200">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center shadow-sm">
                      <MessageCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm font-body">Start chatting</p>
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
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 pt-6 text-center overflow-hidden">
              {/* Back button in top-left */}
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 z-20 group flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span className="text-sm font-medium font-body">Back</span>
              </button>
              
              {/* Subtle background accents */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-blue-50 rounded-full opacity-40"></div>
              <div className="absolute bottom-6 left-4 w-6 h-6 bg-emerald-50 rounded-full opacity-30"></div>
              <div className="absolute top-1/2 right-8 w-4 h-4 bg-teal-50 rounded-full opacity-25"></div>
              
              <div className="mb-5 relative z-10 mt-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-green-800 mb-3 font-body tracking-tight">
                  What's your number?
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 font-body">
                  Your plants will send you care reminders and messages here
                </p>
              </div>
            
              <div className="space-y-5 relative z-10">
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white/50 font-body"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                
                {/* CTA Section */}
                <div className="border-t border-gray-100 pt-5 mt-4">
                  <button
                    onClick={handlePhoneSubmit}
                    disabled={!phone.trim() || loading}
                    className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 px-6 rounded-2xl font-medium text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none font-body mb-3"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating your garden...</span>
                      </div>
                    ) : (
                      'Continue'
                    )}
                  </button>
                  
                  <p className="text-center text-xs text-gray-400 font-body">
                    🔒 Your number is secure and only used for plant messages
                  </p>
                </div>
              </div>
            </div>
            
            {/* Progress indicator positioned just below card */}
            <div className="mt-4">
              <ProgressSteps currentStep={step} />
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
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8 relative">
            {/* Back button in top-left */}
            <button
              onClick={handleBack}
              className="absolute top-0 left-0 group flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="text-sm font-medium font-body">Back</span>
            </button>
            
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
              <Leaf className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-green-800 mb-6 font-body tracking-tight">What plants do you have?</h2>
          </div>

          {/* Main Content Card - Groups plant family, search, and results */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 mb-6">
            {/* Plant Family Section */}
            {addedPlants.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 font-body">Your Plant Family ({addedPlants.length})</h3>
                <div className="flex flex-wrap gap-3">
                  {addedPlants.map((item, index) => (
                    <div key={index} className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 shadow-sm">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900 font-body">{item.nickname}</span>
                      <span className="text-sm text-gray-500">–</span>
                      <span className="text-sm text-gray-600 font-body">{item.plant.name}</span>
                    </div>
                  ))}
                  <button className="inline-flex items-center space-x-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-body">Add More</span>
                  </button>
                </div>
              </div>
            )}

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
                        {filteredPlants.map((plant) => (
                          <button
                            key={plant.id}
                            onClick={() => handleSelectPlant(plant)}
                            className="group relative bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center flex-shrink-0">
                                <Leaf className="w-8 h-8 text-green-500" />
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
                                <ArrowRight className="w-5 h-5" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-body">
                          No plants found matching "{searchTerm}"
                        </p>
                        <p className="text-sm text-gray-400 font-body mt-2">
                          Try a different search term
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
                        setCurrentNickname('');
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
                    value={currentNickname}
                    onChange={(e) => setCurrentNickname(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && currentNickname.trim()) {
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

                {/* Add Button */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setSelectedPlant(null);
                      setCurrentNickname('');
                    }}
                    className="flex-1 py-4 px-6 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-all duration-200 font-body"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPlant}
                    disabled={!currentNickname.trim() || loading}
                    className="flex-1 py-4 px-6 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 transition-all duration-200 font-body flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <span>Adding...</span>
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

          {/* Complete Button */}
          {addedPlants.length > 0 && (
            <div className="text-center">
              <button
                onClick={handleComplete}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-3.5 px-6 rounded-2xl font-medium text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 font-body mb-3 flex items-center justify-center space-x-2"
              >
                <span>
                  {addedPlants.length === 1 ? 'Confirm My Plant Family' : 'Finish Adding Plants'}
                </span>
                <span className="px-2 py-1 bg-white/20 rounded-lg text-xs">
                  {addedPlants.length} plant{addedPlants.length !== 1 ? 's' : ''}
                </span>
              </button>
              
              
              {!selectedPlant && (
                <p className="text-center text-xs text-gray-400 font-body">
                  Or search to add more plants
                </p>
              )}
            </div>
          )}
          
          {/* Progress indicator positioned just below content */}
          <div className="mt-8 flex justify-center">
            <ProgressSteps currentStep={step} />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-4 py-12">
        {/* Subtle floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto relative z-10">
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 pt-6 text-center overflow-hidden">
              {/* Back button in top-left */}
              <button
                onClick={handleBack}
                className="absolute top-4 left-4 z-20 group flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span className="text-sm font-medium font-body">Back</span>
              </button>
              
              {/* Subtle background accents */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-green-50 rounded-full opacity-40"></div>
              <div className="absolute bottom-6 left-4 w-6 h-6 bg-emerald-50 rounded-full opacity-30"></div>
              <div className="absolute top-1/2 right-8 w-4 h-4 bg-teal-50 rounded-full opacity-25"></div>
              
              <div className="mb-5 relative z-10 mt-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center shadow-sm">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-green-800 mb-3 font-body tracking-tight">You're all set!</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5 font-body">
                  Your plants are ready to chat! You can now start conversations with them right here in the app.
                </p>
              </div>
              <div className="space-y-4 relative z-10">
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-blue-700 text-sm font-body">
                    💬 <strong>Coming Soon:</strong> Your plants will also send you care reminders and messages directly to {phone} via text!
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <h3 className="font-medium text-green-900 mb-2 font-body text-sm">Your Plant Family:</h3>
                  <div className="space-y-1">
                    {addedPlants.map((item, index) => (
                      <p key={index} className="text-green-700 text-xs font-body">
                        {item.nickname} ({item.plant.name})
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress indicator positioned just below card */}
            <div className="mt-4">
              <ProgressSteps currentStep={step} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PlantOnboarding;
