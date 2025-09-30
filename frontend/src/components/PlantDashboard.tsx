import React, { useState, useEffect } from 'react';
import { Leaf, Phone, Plus, MessageCircle, Send, Settings, Edit, Trash2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Plant Hub title and settings */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-body">Plant Hub</h1>
              <p className="text-sm text-gray-500 font-body">Manage and chat with your plants</p>
            </div>
          </div>
          
          {/* Settings dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-body">{user.phone}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Left/Right Panel Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Plant Family List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 font-body">Plant Family</h2>
              <button
                onClick={onAddMorePlants}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm font-body"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {userPlants.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-body">No plants yet</h3>
                <p className="text-gray-500 text-sm font-body mb-4">Add your first plant to get started</p>
                <button
                  onClick={onAddMorePlants}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-body transition-colors"
                >
                  Add Plant
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {userPlants.map((userPlant) => {
                  const isSelected = selectedPlant?.id === userPlant.id;
                  return (
                    <div 
                      key={userPlant.id} 
                      onClick={() => handleSelectPlant(userPlant)}
                      className={`group relative p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-green-50 border-green-200 shadow-sm' 
                          : 'border-gray-200 hover:border-green-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getPersonalityGradient(userPlant.personality.name)}`}>
                          <span className="text-lg">{getPersonalityEmoji(userPlant.personality.name)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 font-body truncate">{userPlant.nickname}</h3>
                          <p className="text-sm text-gray-600 font-body truncate">{userPlant.plant_catalog.name}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPersonalityColor(userPlant.personality.name)} font-body`}>
                              {userPlant.personality.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Contextual Area */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedPlant ? (
            <>
              {/* Chat Header */}
              <div className={`p-4 border-b border-gray-200 ${getPersonalityGradient(selectedPlant.personality.name)}`}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-xl">{getPersonalityEmoji(selectedPlant.personality.name)}</span>
                  </div>
                  <div className="text-white">
                    <h3 className="font-semibold font-body">{selectedPlant.nickname}</h3>
                    <p className="text-sm opacity-90 capitalize font-body">{selectedPlant.personality.name} personality</p>
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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 font-body">
                        Hi! I'm <span className="text-green-600">{selectedPlant.nickname}</span> 🌱
                      </h3>
                      <p className="text-gray-600 mb-6 font-body">
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
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 font-body">Welcome to Plant Hub</h3>
                <p className="text-gray-500 font-body">Select a plant from the left to start chatting</p>
              </div>
            </div>
          )}
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
