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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Leaf className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">PlantTexts</h1>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Phone className="w-4 h-4" />
            <span>{user.phone}</span>
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
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet</h3>
                <p className="text-gray-600 mb-4">Add your first plant to start chatting!</p>
                <button
                  onClick={onAddMorePlants}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Your First Plant
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userPlants.map((userPlant) => (
                  <div 
                    key={userPlant.id} 
                    onClick={() => handleSelectPlant(userPlant)}
                    className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
                      selectedPlant?.id === userPlant.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{userPlant.nickname}</h3>
                        <p className="text-sm text-gray-600 italic">{userPlant.plant_catalog.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPersonalityColor(userPlant.personality.name)}`}>
                            {userPlant.personality.name}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getDifficultyColor(userPlant.plant_catalog.difficulty_level)}`}>
                            {userPlant.plant_catalog.difficulty_level}
                          </span>
                        </div>
                      </div>
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-2xl shadow-lg flex flex-col h-96">
            {selectedPlant ? (
              <>
                {/* Chat Header */}
                <div className="bg-green-600 text-white p-4 rounded-t-2xl">
                  <h3 className="font-semibold">Chat with {selectedPlant.nickname}</h3>
                  <p className="text-sm text-green-100">{selectedPlant.personality.name} personality</p>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p className="mb-4">Hi! I'm <strong>{selectedPlant.nickname}</strong> 🌱</p>
                      <p className="text-sm mb-4">I have a <span className="font-medium">{selectedPlant.personality.name}</span> personality. Try one of these:</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <button
                          onClick={() => handleCareReminder('watering')}
                          className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          💧 Watering reminder
                        </button>
                        <button
                          onClick={() => handleCareReminder('fertilizing')}
                          className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm hover:bg-green-200 transition-colors"
                        >
                          🌿 Fertilizing reminder
                        </button>
                        <button
                          onClick={() => handleCareReminder('misting')}
                          className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg text-sm hover:bg-purple-200 transition-colors"
                        >
                          💨 Misting reminder
                        </button>
                        <button
                          onClick={() => handleSendPersonalityDemo()}
                          className="bg-yellow-100 text-yellow-700 px-3 py-2 rounded-lg text-sm hover:bg-yellow-200 transition-colors"
                        >
                          ✨ Say hello
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">Or just type a message below!</p>
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

        {/* Help & SMS Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <Phone className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-gray-900">SMS Setup</h3>
            </div>
            <div className="text-gray-600 text-sm">
              <p>Test your plant personalities here, then they'll send SMS messages to {user.phone}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <MessageCircle className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-gray-900">What You Can Do</h3>
            </div>
            <div className="text-gray-600 text-sm space-y-1">
              <p>💬 <strong>Chat</strong> - Have conversations with your plants</p>
              <p>💧 <strong>Care Reminders</strong> - Get watering, fertilizing & misting tips</p>
              <p>✨ <strong>Personalities</strong> - Each plant has a unique character</p>
              <p>🌱 <strong>Add More</strong> - Expand your plant family anytime</p>
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

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'text-green-700 bg-green-100';
    case 'medium': return 'text-yellow-700 bg-yellow-100';
    case 'hard': return 'text-red-700 bg-red-100';
    default: return 'text-gray-700 bg-gray-100';
  }
};

export default PlantDashboard;
