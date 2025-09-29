import React, { useState, useEffect } from 'react';
import { Leaf, Phone, Plus, MessageCircle, Send } from 'lucide-react';
import { getUserPlants, chatWithPlant, getCareReminder } from '../api';
import { User, UserPlant } from '../types';

interface PlantDashboardProps {
  user: User;
  onAddMorePlants: () => void;
}

const PlantDashboard: React.FC<PlantDashboardProps> = ({ user, onAddMorePlants }) => {
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<UserPlant | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const plants = await getUserPlants(user.id);
        setUserPlants(plants);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [user.id]);

  const handleSelectPlant = (plant: UserPlant) => {
    setSelectedPlant(plant);
    setChatMessages([]);
  };

  const handleSendMessage = async () => {
    if (!selectedPlant || !messageInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: messageInput.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setSendingMessage(true);

    try {
      const response = await chatWithPlant(selectedPlant.id, messageInput.trim());
      const plantMessage = {
        id: (Date.now() + 1).toString(),
        type: 'plant',
        message: response.plant_response,
        timestamp: response.timestamp
      };
      setChatMessages(prev => [...prev, plantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'plant',
        message: "Sorry, I'm having trouble responding right now. Try again in a moment!",
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCareReminder = async (taskType: string) => {
    if (!selectedPlant) return;
    
    try {
      const response = await getCareReminder(selectedPlant.id, taskType);
      const reminderMessage = {
        id: Date.now().toString(),
        type: 'plant',
        message: response.message,
        timestamp: response.timestamp
      };
      setChatMessages(prev => [...prev, reminderMessage]);
    } catch (error) {
      console.error('Failed to get care reminder:', error);
    }
  };

  const handleSendPersonalityDemo = async () => {
    if (!selectedPlant) return;
    
    try {
      const response = await chatWithPlant(selectedPlant.id, "Hello! Can you introduce yourself?");
      const introMessage = {
        id: Date.now().toString(),
        type: 'plant',
        message: response.plant_response,
        timestamp: response.timestamp
      };
      setChatMessages(prev => [...prev, introMessage]);
    } catch (error) {
      console.error('Failed to get personality demo:', error);
      const fallbackMessage = {
        id: Date.now().toString(),
        type: 'plant',
        message: `Hey there! I'm ${selectedPlant.nickname} and I have a ${selectedPlant.personality.name} personality. Let's chat! 🌱`,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, fallbackMessage]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center space-x-4 mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                PlantTexts
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-3 h-3" />
                <span>{user.phone}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Plants Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Plant Family</h2>
              <button
                onClick={onAddMorePlants}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Plant</span>
              </button>
            </div>

            {userPlants.length === 0 ? (
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Your garden awaits</h3>
                <p className="text-gray-600 mb-6 text-lg">Add your first plant friend and start your journey into plant parenthood!</p>
                <button
                  onClick={onAddMorePlants}
                  className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                >
                  <span className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Plant</span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userPlants.map((userPlant) => {
                  const isSelected = selectedPlant?.id === userPlant.id;
                  return (
                    <div 
                      key={userPlant.id} 
                      onClick={() => handleSelectPlant(userPlant)}
                      className={`group relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border transition-all duration-200 cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
                        isSelected 
                          ? 'ring-2 ring-green-400 border-green-200 bg-green-50/70' 
                          : 'border-white/20 hover:border-green-200'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getPersonalityGradient(userPlant.personality.name)}`}>
                            <span className="text-2xl">{getPersonalityEmoji(userPlant.personality.name)}</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{userPlant.nickname}</h3>
                            <p className="text-sm text-gray-600 italic mb-2">{userPlant.plant_catalog.name}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPersonalityColor(userPlant.personality.name)}`}>
                                {userPlant.personality.name}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(userPlant.plant_catalog.difficulty_level)}`}>
                                {userPlant.plant_catalog.difficulty_level}
                              </span>
                            </div>
                          </div>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-green-100 group-hover:text-green-600'
                          }`}>
                            <MessageCircle className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 flex flex-col h-[500px]">
            {selectedPlant ? (
              <>
                {/* Enhanced Chat Header */}
                <div className={`p-6 rounded-t-3xl ${getPersonalityGradient(selectedPlant.personality.name)}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">{getPersonalityEmoji(selectedPlant.personality.name)}</span>
                    </div>
                    <div className="text-white">
                      <h3 className="font-bold text-lg">{selectedPlant.nickname}</h3>
                      <p className="text-sm opacity-90 capitalize">{selectedPlant.personality.name} personality</p>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                        <MessageCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Hi! I'm <span className="text-green-600">{selectedPlant.nickname}</span> 🌱
                      </h3>
                      <p className="text-gray-600 mb-6">
                        I have a <span className="font-medium text-gray-900">{selectedPlant.personality.name}</span> personality. 
                        Let's start our conversation!
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-6 max-w-sm mx-auto">
                        <button
                          onClick={() => handleCareReminder('watering')}
                          className="group bg-blue-50 text-blue-700 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-blue-100 hover:scale-105 transition-all duration-200"
                        >
                          <span className="block text-lg mb-1">💧</span>
                          Watering
                        </button>
                        <button
                          onClick={() => handleCareReminder('fertilizing')}
                          className="group bg-green-50 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-green-100 hover:scale-105 transition-all duration-200"
                        >
                          <span className="block text-lg mb-1">🌿</span>
                          Fertilizing
                        </button>
                        <button
                          onClick={() => handleCareReminder('misting')}
                          className="group bg-purple-50 text-purple-700 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-purple-100 hover:scale-105 transition-all duration-200"
                        >
                          <span className="block text-lg mb-1">💨</span>
                          Misting
                        </button>
                        <button
                          onClick={() => handleSendPersonalityDemo()}
                          className="group bg-yellow-50 text-yellow-700 px-4 py-3 rounded-2xl text-sm font-medium hover:bg-yellow-100 hover:scale-105 transition-all duration-200"
                        >
                          <span className="block text-lg mb-1">✨</span>
                          Say hello
                        </button>
                      </div>
                      <p className="text-sm text-gray-400">Or type your own message below</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          msg.type === 'user' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Message ${selectedPlant.nickname}...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendingMessage}
                      className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a plant to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                <Phone className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">SMS Ready</h3>
            </div>
            <div className="text-gray-600 leading-relaxed">
              <p>Your plants are ready to text you! Once deployed, they'll send personalized messages and care reminders directly to <span className="font-medium text-gray-900">{user.phone}</span></p>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Plant Care Made Fun</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-700">
                <span className="text-lg">💬</span>
                <span><strong>Chat</strong> - Real conversations with personality</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <span className="text-lg">💧</span>
                <span><strong>Smart Reminders</strong> - Never forget watering again</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <span className="text-lg">✨</span>
                <span><strong>Unique Personalities</strong> - Each plant has character</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-700">
                <span className="text-lg">🌱</span>
                <span><strong>Grow Together</strong> - Build better care habits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getPersonalityColor = (personality: string) => {
  switch (personality) {
    case 'dramatic': return 'text-purple-700 bg-purple-100';
    case 'sarcastic': return 'text-blue-700 bg-blue-100';
    case 'chill': return 'text-green-700 bg-green-100';
    case 'chatty': return 'text-orange-700 bg-orange-100';
    case 'zen': return 'text-indigo-700 bg-indigo-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

const getPersonalityGradient = (personality: string) => {
  switch (personality) {
    case 'dramatic': return 'bg-gradient-to-br from-purple-400 to-pink-500';
    case 'sarcastic': return 'bg-gradient-to-br from-blue-400 to-cyan-500';
    case 'chill': return 'bg-gradient-to-br from-green-400 to-emerald-500';
    case 'chatty': return 'bg-gradient-to-br from-orange-400 to-yellow-500';
    case 'zen': return 'bg-gradient-to-br from-indigo-400 to-purple-500';
    default: return 'bg-gradient-to-br from-gray-400 to-gray-500';
  }
};

const getPersonalityEmoji = (personality: string) => {
  switch (personality) {
    case 'dramatic': return '🎭';
    case 'sarcastic': return '😏';
    case 'chill': return '😌';
    case 'chatty': return '💬';
    case 'zen': return '🧘';
    default: return '🌱';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'text-green-700 bg-green-100';
    case 'medium': return 'text-yellow-700 bg-yellow-100';
    case 'hard': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

export default PlantDashboard;
