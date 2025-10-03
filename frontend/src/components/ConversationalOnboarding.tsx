import React, { useState, useEffect } from 'react';
import { ArrowRight, Leaf, Check, ArrowLeft } from 'lucide-react';
import { getPlantCatalog, addPlantToUser, findOrCreateUser } from '../api';
import { Plant, User } from '../types';
import { getPlantImage } from '../utils/plantImageMapping';

interface ConversationalOnboardingProps {
  onComplete: (user: User) => void;
}

type Step = 'welcome' | 'phone' | 'plants' | 'firstHello';

// Plant growth progress indicator
const GrowthProgress: React.FC<{ currentStep: Step }> = ({ currentStep }) => {
  const steps: Step[] = ['welcome', 'phone', 'plants', 'firstHello'];
  const currentIndex = steps.indexOf(currentStep);
  
  const icons = ['🌰', '🌱', '🌿', '🌸']; // Seed → Sprout → Leaf → Bloom
  
  return (
    <div className="flex items-center justify-center space-x-2">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;
        
        return (
          <div
            key={step}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
              ${isActive ? 'scale-125 bg-green-100' : isComplete ? 'bg-green-50' : 'bg-gray-50'}
            `}
          >
            <span className={`text-2xl transition-all duration-500 ${isActive ? 'scale-110' : ''}`}>
              {icons[index]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const ConversationalOnboarding: React.FC<ConversationalOnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('welcome');
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Fade in animation on step change
  useEffect(() => {
    setShowContent(false);
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    if (step === 'plants') {
      loadPlants();
    }
  }, [step]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlants([]);
    } else {
      const filtered = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.species.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPlants(filtered.slice(0, 6));
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
      const newUser = await findOrCreateUser({ phone: phone.trim() });
      setUser(newUser);
      setStep('plants');
    } catch (error) {
      console.error('Failed to create user:', error);
      alert('Hmm, something went wrong. Mind trying again?');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlant = async () => {
    if (!selectedPlant || !nickname.trim() || !user) return;

    setLoading(true);
    try {
      await addPlantToUser({
        user_id: user.id,
        nickname: nickname.trim(),
        plant_catalog_id: selectedPlant.id,
      });
      
      setStep('firstHello');
    } catch (error) {
      console.error('Failed to add plant:', error);
      alert('Oops, couldn\'t add your plant. Try again?');
    } finally {
      setLoading(false);
    }
  };

  // Welcome Step - Conversational intro
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30 flex items-center justify-center p-4">
        <div className={`max-w-lg w-full transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Plant icon with subtle animation */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center shadow-lg animate-pulse">
            <Leaf className="w-10 h-10 text-green-600" />
          </div>
          
          {/* Speech bubble from the app */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6 relative">
            {/* Speech bubble tail */}
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-b border-r border-gray-100 rotate-45"></div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3 font-body">
              Bring your plants to life.
            </h1>
            <p className="text-lg text-gray-600 font-body leading-relaxed mb-4">
              Give them a voice. They'll remind you when they need care, answer your questions, and become part of your daily rhythm.
            </p>
            <p className="text-sm text-gray-500 font-body">
              Setup takes about a minute.
            </p>
          </div>

          <button
            onClick={() => setStep('phone')}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-4 px-6 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 font-body flex items-center justify-center space-x-2"
          >
            <span>Bring Them to Life</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Growth progress */}
          <div className="mt-8">
            <GrowthProgress currentStep={step} />
          </div>
        </div>
      </div>
    );
  }

  // Phone Step - Conversational ask
  if (step === 'phone') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30 flex items-center justify-center p-4">
        <div className={`max-w-lg w-full transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Speech bubble from the app */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6 relative">
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-b border-r border-gray-100 rotate-45"></div>
            
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 font-body">
                  Where should we text you?
                </h2>
                <p className="text-gray-600 font-body">
                  Your plants will send you care reminders and messages here.
                </p>
              </div>
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && phone.trim()) {
                  handlePhoneSubmit();
                }
              }}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-body transition-all duration-200 mb-4"
              autoFocus
            />

            <p className="text-xs text-gray-400 font-body">
              🔒 Your number is safe. We only use it for plant messages.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep('welcome')}
              className="py-4 px-6 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-all duration-200 font-body flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <button
              onClick={handlePhoneSubmit}
              disabled={!phone.trim() || loading}
              className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white py-4 px-6 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 transition-all duration-200 font-body flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Setting up...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-8">
            <GrowthProgress currentStep={step} />
          </div>
        </div>
      </div>
    );
  }

  // Plants Step - Conversational plant selection
  if (step === 'plants') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30 flex items-center justify-center p-4 py-8">
        <div className={`max-w-2xl w-full transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {!selectedPlant ? (
            <>
              {/* Speech bubble */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6 relative">
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-b border-r border-gray-100 rotate-45"></div>
                
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 font-body">
                      What type of plant do you have?
                    </h2>
                    <p className="text-gray-600 font-body">
                      Search for the plant species you own (e.g., Snake Plant, Monstera).
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Try 'Snake Plant' or 'Monstera'"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base font-body transition-all duration-200"
                  autoFocus
                />

                {/* Quick suggestions */}
                {!searchTerm && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {['Snake Plant', 'Monstera', 'Pothos', 'Fiddle Leaf Fig'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setSearchTerm(suggestion)}
                        className="px-3 py-1.5 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-full text-sm font-body transition-all duration-200 border border-gray-200 hover:border-green-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Results */}
              {filteredPlants.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {filteredPlants.map((plant) => {
                    const plantImage = getPlantImage(plant);
                    return (
                      <button
                        key={plant.id}
                        onClick={() => {
                          setSelectedPlant(plant);
                          setSearchTerm('');
                        }}
                        className="group bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-green-500 hover:shadow-lg transition-all duration-200 text-left"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center overflow-hidden">
                            {plantImage ? (
                              <img 
                                src={plantImage} 
                                alt={plant.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Leaf className="w-7 h-7 text-green-500" />
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                        </div>
                        <h3 className="font-semibold text-gray-900 font-body mb-1 group-hover:text-green-700 transition-colors">
                          {plant.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-body mb-2">
                          {plant.species}
                        </p>
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 font-body">
                          {plant.difficulty_level}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {searchTerm && filteredPlants.length === 0 && (
                <div className="text-center py-12 text-gray-500 font-body">
                  <p>No plants found for "{searchTerm}"</p>
                  <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                </div>
              )}

              {/* Back button for plant search */}
              <button
                onClick={() => setStep('phone')}
                className="py-3 px-6 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-all duration-200 font-body flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            </>
          ) : (
            // Selected plant - give it a name
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6 relative">
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-b border-r border-gray-100 rotate-45"></div>
              
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 font-body">
                    What's your {selectedPlant.name}'s name?
                  </h2>
                  <p className="text-gray-600 font-body">
                    What do you call them when no one's listening?
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nickname.trim()) {
                    handleAddPlant();
                  }
                }}
                placeholder="e.g., Sneaky Steve, Monstera Lisa, Larry"
                className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-body transition-all duration-200 mb-4"
                autoFocus
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedPlant(null);
                    setNickname('');
                  }}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-all duration-200 font-body"
                >
                  Back
                </button>
                <button
                  onClick={handleAddPlant}
                  disabled={!nickname.trim() || loading}
                  className="flex-1 py-3 px-6 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 transition-all duration-200 font-body flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <span>Adding...</span>
                  ) : (
                    <>
                      <span>Meet {nickname || 'my plant'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mt-8">
            <GrowthProgress currentStep={step} />
          </div>
        </div>
      </div>
    );
  }

  // First Hello - The plant introduces itself
  if (step === 'firstHello') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50/30 flex items-center justify-center p-4">
        <div className={`max-w-lg w-full transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Blooming plant icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center shadow-lg">
            <span className="text-4xl animate-pulse">🌸</span>
          </div>

          {/* Message from the plant */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6 relative">
            <div className="absolute -bottom-3 left-12 w-6 h-6 bg-white border-b border-l border-gray-100 rotate-45"></div>
            
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 font-body">{nickname}</p>
                <p className="text-xs text-gray-500 font-body">{selectedPlant?.name}</p>
              </div>
            </div>

            <p className="text-lg text-gray-800 font-body leading-relaxed mb-4">
              You'll hear from me when I need water, more light, or just want to chat about how I'm doing.
            </p>
            <p className="text-base text-gray-700 font-body leading-relaxed">
              Text me anytime—I'll help you keep me healthy and happy.
            </p>
          </div>

          <button
            onClick={() => {
              if (user) onComplete(user);
            }}
            className="w-full bg-green-700 hover:bg-green-800 text-white py-4 px-6 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 font-body flex items-center justify-center space-x-2"
          >
            <span>Start chatting</span>
            <Check className="w-5 h-5" />
          </button>

          <div className="mt-8">
            <GrowthProgress currentStep={step} />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ConversationalOnboarding;

