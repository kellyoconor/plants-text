import React, { useState, useEffect } from 'react';
import { ArrowRight, Leaf, Check, ArrowLeft, ChevronDown } from 'lucide-react';
import { getPlantCatalog, addPlantToUser, findOrCreateUser } from '../api';
import { Plant, User } from '../types';
import { getPlantImage } from '../utils/plantImageMapping';
import { messages, getLoadingMessage } from '../utils/messages';

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
  const [groupedResults, setGroupedResults] = useState<Array<{baseName: string; primary: Plant; varieties: Plant[]; hasMultiple: boolean}>>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [expandedPlantGroup, setExpandedPlantGroup] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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
      setGroupedResults([]);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = plants.filter(plant => 
        plant.name.toLowerCase().includes(searchLower) ||
        plant.species.toLowerCase().includes(searchLower)
      );
      
      // Group plants by base name (e.g., "Snake plant" varieties together)
      const grouped = groupPlantsByBaseName(filtered);
      setGroupedResults(grouped.slice(0, 6));
      
      // For backward compatibility, also set filteredPlants
      setFilteredPlants(grouped.map(g => g.primary).slice(0, 6));
    }
  }, [searchTerm, plants]);
  
  // Group plants by base name
  const groupPlantsByBaseName = (plantList: Plant[]) => {
    const groups = new Map<string, Plant[]>();
    
    plantList.forEach(plant => {
      // Extract base name (e.g., "Snake plant" from "Snake plant (Sansevieria trifasciata Laurentii)")
      const baseName = plant.name.toLowerCase().trim();
      
      if (!groups.has(baseName)) {
        groups.set(baseName, []);
      }
      groups.get(baseName)!.push(plant);
    });
    
    return Array.from(groups.entries()).map(([baseName, varieties]) => ({
      baseName,
      primary: varieties[0], // Use first as primary
      varieties,
      hasMultiple: varieties.length > 1
    }));
  };

  const loadPlants = async () => {
    try {
      const plantData = await getPlantCatalog();
      setPlants(plantData);
    } catch (error) {
      console.error('Failed to load plants:', error);
    }
  };

  const validatePhone = (phoneNumber: string): { valid: boolean; error?: string } => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Check if it's empty
    if (!digitsOnly) {
      return { valid: false, error: messages.errors.phoneInvalid.message };
    }
    
    // Remove leading 1 if present for US numbers
    const numberWithoutCountry = digitsOnly.startsWith('1') ? digitsOnly.slice(1) : digitsOnly;
    
    // Check length
    if (numberWithoutCountry.length < 10) {
      return { valid: false, error: messages.errors.phoneTooShort.message };
    }
    
    if (numberWithoutCountry.length > 10) {
      return { valid: false, error: messages.errors.phoneTooLong.message };
    }
    
    return { valid: true };
  };

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) return;
    
    // Clear previous error
    setPhoneError('');
    
    // Validate phone number
    const validation = validatePhone(phone);
    if (!validation.valid) {
      setPhoneError(validation.error || messages.errors.phoneInvalid.message);
      return;
    }
    
    setLoading(true);
    try {
      // Format phone number to E.164 format (+1XXXXXXXXXX)
      let formattedPhone = phone.trim().replace(/\D/g, ''); // Remove non-digits
      
      // Add +1 prefix if not present (assuming US numbers)
      if (!formattedPhone.startsWith('1')) {
        formattedPhone = '1' + formattedPhone;
      }
      formattedPhone = '+' + formattedPhone;
      
      const newUser = await findOrCreateUser({ phone: formattedPhone });
      setUser(newUser);
      setStep('plants');
    } catch (error) {
      console.error('Failed to create user:', error);
      setPhoneError('Hmm, something went wrong. Mind trying again?');
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
              Your plants have something to say.
            </h1>
            <p className="text-lg text-gray-600 font-body leading-relaxed mb-4">
              They already brighten your space — now they're part of your group chat.
            </p>
            <p className="text-sm text-gray-500 font-body">
              Setup takes less than a minute — bring them to life.
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
                  Where should your plants text you?
                </h2>
                <p className="text-gray-600 font-body">
                  This is where their notes, nudges, and reminders will arrive.
                </p>
              </div>
            </div>

            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                let value = e.target.value;
                // If user is typing and there's no +1, add it
                if (value && !value.startsWith('+1')) {
                  value = '+1 ' + value.replace(/^\+?1?\s*/, '');
                }
                setPhone(value);
                // Clear error when user starts typing
                if (phoneError) setPhoneError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && phone.trim()) {
                  handlePhoneSubmit();
                }
              }}
              placeholder="+1 (555) 123-4567"
              className={`w-full px-4 py-4 bg-gray-50 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-body transition-all duration-200 ${
                phoneError ? 'border-red-300 mb-2' : 'border-gray-200 mb-4'
              }`}
              autoFocus
            />
            
            {phoneError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 font-body">{phoneError}</p>
              </div>
            )}

            <p className="text-xs text-gray-400 font-body mb-4">
              🔒 Your number is safe. We only use it for plant messages.
            </p>

            {/* Terms & Privacy Checkbox */}
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
              />
              <span className="text-sm text-gray-600 font-body">
                I agree to the{' '}
                <a
                  href="/terms.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </span>
            </label>
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
              disabled={!phone.trim() || loading || !agreedToTerms}
              className="flex-1 bg-green-700 hover:bg-green-800 disabled:bg-gray-300 text-white py-4 px-6 rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] disabled:scale-100 transition-all duration-200 font-body flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>{getLoadingMessage('generalLoading')}</span>
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

              {/* Search Results - Grouped by plant type */}
              {groupedResults.length > 0 && (
                <>
                  <div className="space-y-4 mb-4">
                    {groupedResults.map((group) => {
                      const plant = group.primary;
                      const plantImage = getPlantImage(plant);
                      const wateringFreq = plant.care_requirements.watering_frequency_days;
                      const waterLevel = wateringFreq >= 10 ? 'Low water' : wateringFreq >= 5 ? 'Medium water' : 'High water';
                      const lightLevel = plant.care_requirements.light_level;
                      const lightText = lightLevel === 'low' ? 'Low light' : lightLevel === 'high' ? 'Bright light' : 'Medium light';
                      const difficultyText = plant.difficulty_level === 'easy' ? 'Beginner-friendly' : 
                                            plant.difficulty_level === 'medium' ? 'Intermediate' : 'Advanced';
                      const isExpanded = expandedPlantGroup === group.baseName;
                      
                      return (
                        <div key={group.baseName} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
                          {/* Primary Plant Card */}
                          <button
                            onClick={() => {
                              setSelectedPlant(plant);
                              setSearchTerm('');
                            }}
                            className="group w-full p-5 hover:bg-gray-50 transition-all duration-200 text-left"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                <div>
                                  <h3 className="font-semibold text-gray-900 font-body group-hover:text-green-700 transition-colors">
                                    {plant.name}
                                  </h3>
                                  <p className="text-xs text-gray-400 font-body">
                                    {plant.species.split(' ').slice(0, 2).join(' ')}
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-colors flex-shrink-0" />
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 font-body">
                                {waterLevel}
                              </span>
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600 font-body">
                                {lightText}
                              </span>
                              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 font-body">
                                {difficultyText}
                              </span>
                            </div>
                          </button>
                          
                          {/* Varieties Expansion */}
                          {group.hasMultiple && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedPlantGroup(isExpanded ? null : group.baseName);
                                }}
                                className="w-full px-5 py-2 border-t border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                              >
                                <span className="font-medium">See varieties ({group.varieties.length})</span>
                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                              
                              {isExpanded && (
                                <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-2">
                                  {group.varieties.map((variety) => (
                                    <button
                                      key={variety.id}
                                      onClick={() => {
                                        setSelectedPlant(variety);
                                        setSearchTerm('');
                                      }}
                                      className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-green-50 hover:border-green-200 border border-gray-200 transition-colors"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="text-sm font-medium text-gray-900">{variety.name}</p>
                                          <p className="text-xs text-gray-500">{variety.species}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Helper text */}
                  {searchTerm && (
                    <p className="text-sm text-gray-500 font-body text-center mb-6">
                      Not sure? Choose "{groupedResults[0]?.primary.name}." You can refine later.
                    </p>
                  )}
                </>
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
                    You know, the one you use when no one's listening...
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
                    <span>{getLoadingMessage('addingPlant')}</span>
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

