import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, MessageCircle, Send, Plus, Sparkles } from 'lucide-react';
import { getPlantCatalog, getUserPlants, addPlantToUser, chatWithPlant, getCareReminder } from '../api';
import { Plant, UserPlant } from '../types';
import FadeIn from './animations/FadeIn';
import TypeWriter from './animations/TypeWriter';
import FloatingElements from './animations/FloatingElements';
import AnimatedPlantCard from './ui/AnimatedPlantCard';
import AnimatedChatBubble from './ui/AnimatedChatBubble';

interface ChatMessage {
  id: string;
  type: 'user' | 'plant' | 'care_reminder';
  message: string;
  timestamp: string;
  taskType?: string;
  isNew?: boolean;
}

const EnhancedApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedUserPlant, setSelectedUserPlant] = useState<UserPlant | null>(null);
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  // const [showWelcome, setShowWelcome] = useState(true); // Removed unused state

  useEffect(() => {
    loadPlants();
    loadUserPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const data = await getPlantCatalog();
      setPlants(data.slice(0, 12)); // Show first 12 for better layout
    } catch (error) {
      console.error('Failed to load plants:', error);
    }
  };

  const loadUserPlants = async () => {
    try {
      const data = await getUserPlants(1); // User ID 1
      setUserPlants(data);
      if (data.length > 0) {
        setSelectedUserPlant(data[0]);
      }
    } catch (error) {
      console.error('Failed to load user plants:', error);
    }
  };

  const handleAddPlant = async () => {
    if (!selectedPlant || !nickname) return;
    
    setLoading(true);
    try {
      await addPlantToUser({
        user_id: 1,
        nickname: nickname,
        plant_catalog_id: selectedPlant.id,
      });
      
      await loadUserPlants();
      setSelectedPlant(null);
      setNickname('');
      
      // Show success animation
      setChatMessages([{
        id: Date.now().toString(),
        type: 'plant',
        message: `🌱 Welcome to the family! I'm ${nickname}, your new plant companion!`,
        timestamp: new Date().toISOString(),
        isNew: true,
      }]);
      
      setActiveTab('chat');
    } catch (error) {
      console.error('Failed to add plant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUserPlant || !message) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(),
      type: 'user', 
      message, 
      timestamp: new Date().toISOString() 
    };
    setChatMessages(prev => [...prev, userMsg]);
    
    const msgToSend = message;
    setMessage('');
    setLoading(true);

    try {
      const response = await chatWithPlant(selectedUserPlant.id, msgToSend);
      const plantMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(),
        type: 'plant', 
        message: response.plant_response, 
        timestamp: response.timestamp,
        isNew: true,
      };
      setChatMessages(prev => [...prev, plantMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'plant',
        message: "Sorry, I'm having trouble responding right now. Try again in a moment! 🌱",
        timestamp: new Date().toISOString(),
        isNew: true,
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCareReminder = async (taskType: string) => {
    if (!selectedUserPlant) return;

    setLoading(true);
    try {
      const response = await getCareReminder(selectedUserPlant.id, taskType);
      const careMsg: ChatMessage = { 
        id: Date.now().toString(),
        type: 'care_reminder', 
        message: response.message, 
        timestamp: response.timestamp,
        taskType,
        isNew: true,
      };
      setChatMessages(prev => [...prev, careMsg]);
    } catch (error) {
      console.error('Failed to get care reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Animated Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-green-100 sticky top-0 z-50">
        <div className="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
          <FadeIn direction="down">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <FloatingElements intensity="low">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Leaf className="w-6 h-6 text-white" />
                  </motion.div>
                </FloatingElements>
                
                <div>
                  <motion.h1 
                    className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Plant Texts
                  </motion.h1>
                  <TypeWriter 
                    text="Give your plants a personality!"
                    speed={80}
                    className="text-gray-600 text-sm"
                  />
                </div>
              </div>

              <motion.div 
                className="hidden md:flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-700 font-medium">Live Demo</span>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </header>

      {/* Navigation */}
      <div className="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
        <FadeIn delay={0.3}>
          <nav className="flex justify-center space-x-4 py-6">
            {[
              { id: 'catalog', label: 'Plant Catalog', icon: Leaf },
              { id: 'chat', label: 'Chat with Plants', icon: MessageCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300
                    ${activeTab === tab.id
                      ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                      : 'bg-white text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  layout
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </FadeIn>
      </div>

      {/* Main Content */}
      <main className="max-width: 1200px; margin: 0 auto; padding: 0 20px; padding-bottom: 40px;">
        {activeTab === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <FadeIn delay={0.2}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plant Companion</h2>
                <p className="text-gray-600">Each plant comes with its own unique personality</p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Plant Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plants.map((plant, index) => (
                    <AnimatedPlantCard
                      key={plant.id}
                      plant={plant}
                      isSelected={selectedPlant?.id === plant.id}
                      onSelect={(plant) => setSelectedPlant(plant)}
                      delay={index * 0.1}
                    />
                  ))}
                </div>
              </div>

              {/* Selection Panel */}
              <div className="lg:col-span-1">
                <div className="sticky top-32">
                  <motion.div 
                    className="bg-white rounded-xl shadow-xl border border-gray-200 p-6"
                    layout
                  >
                    {selectedPlant ? (
                      <FadeIn key={selectedPlant.id}>
                        <div className="space-y-6">
                          <div className="text-center">
                            <FloatingElements>
                              <div className="text-4xl mb-3">🌱</div>
                            </FloatingElements>
                            <h3 className="text-xl font-bold text-gray-900">{selectedPlant.name}</h3>
                            <p className="text-gray-600 italic text-sm">{selectedPlant.species}</p>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Give your plant a name ✨
                              </label>
                              <motion.input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="e.g., Fernando, Drama Queen"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                whileFocus={{ scale: 1.02 }}
                              />
                            </div>

                            <motion.button
                              onClick={handleAddPlant}
                              disabled={!nickname || loading}
                              className={`
                                w-full py-3 px-4 rounded-lg font-medium transition-all duration-300
                                ${!nickname || loading
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg hover:shadow-xl'
                                }
                              `}
                              whileHover={!nickname || loading ? {} : { scale: 1.02 }}
                              whileTap={!nickname || loading ? {} : { scale: 0.98 }}
                            >
                              {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  <span>Adding...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center space-x-2">
                                  <Plus className="w-4 h-4" />
                                  <span>Add to My Garden</span>
                                </div>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </FadeIn>
                    ) : (
                      <div className="text-center py-8">
                        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Select a plant to see details</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            {userPlants.length === 0 ? (
              <FadeIn>
                <div className="text-center py-16">
                  <FloatingElements>
                    <div className="text-6xl mb-6">🌱</div>
                  </FloatingElements>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No plants yet!</h3>
                  <p className="text-gray-600 mb-8">Add some plants from the catalog to start chatting.</p>
                  <motion.button
                    onClick={() => setActiveTab('catalog')}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse Plants
                  </motion.button>
                </div>
              </FadeIn>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Plant Selector */}
                <div className="lg:col-span-1">
                  <FadeIn>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sticky top-32">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                        <Leaf className="w-5 h-5 text-green-500" />
                        <span>Your Garden</span>
                      </h3>
                      
                      <div className="space-y-3">
                        {userPlants.map((plant, index) => (
                          <motion.button
                            key={plant.id}
                            onClick={() => { setSelectedUserPlant(plant); setChatMessages([]); }}
                            className={`
                              w-full text-left p-3 rounded-lg border-2 transition-all
                              ${selectedUserPlant?.id === plant.id
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-green-300 bg-white'
                              }
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="font-medium text-gray-900">{plant.nickname}</div>
                            <div className="text-sm text-gray-600">{plant.plant_catalog.name}</div>
                            <div className="text-xs text-gray-500 capitalize">
                              {plant.personality.name} personality
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {/* Quick Care Actions */}
                      {selectedUserPlant && (
                        <motion.div 
                          className="mt-6 pt-4 border-t border-gray-200"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          <h4 className="font-medium text-gray-900 mb-3">Quick Care</h4>
                          <div className="space-y-2">
                            {['watering', 'fertilizing', 'misting'].map((task, index) => (
                              <motion.button
                                key={task}
                                onClick={() => handleCareReminder(task)}
                                disabled={loading}
                                className="w-full flex items-center justify-center space-x-2 p-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                              >
                                <span className="capitalize">{task}</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </FadeIn>
                </div>

                {/* Chat Interface */}
                <div className="lg:col-span-3">
                  {selectedUserPlant ? (
                    <FadeIn delay={0.2}>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[600px] flex flex-col overflow-hidden">
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4">
                          <div className="flex items-center space-x-3">
                            <FloatingElements intensity="low">
                              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Leaf className="w-5 h-5" />
                              </div>
                            </FloatingElements>
                            <div>
                              <h3 className="font-bold text-lg">{selectedUserPlant.nickname}</h3>
                              <p className="text-sm opacity-90">
                                {selectedUserPlant.plant_catalog.name} • {selectedUserPlant.personality.name} personality
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                          {chatMessages.length === 0 && (
                            <motion.div 
                              className="text-center py-12"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                            >
                              <FloatingElements>
                                <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
                              </FloatingElements>
                              <TypeWriter 
                                text={`Start a conversation with ${selectedUserPlant.nickname}!`}
                                speed={50}
                                className="text-gray-600"
                              />
                            </motion.div>
                          )}
                          
                          {chatMessages.map((msg, index) => (
                            <AnimatedChatBubble
                              key={msg.id}
                              message={msg}
                              plantPersonality={selectedUserPlant.personality.name}
                              index={index}
                            />
                          ))}
                          
                          {loading && (
                            <motion.div 
                              className="flex justify-start mb-4"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                            >
                              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-lg">
                                <div className="flex items-center space-x-2">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                  </div>
                                  <span className="text-sm text-gray-600">{selectedUserPlant.nickname} is thinking...</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Message Input */}
                        <div className="border-t border-gray-200 p-4 bg-white">
                          <div className="flex space-x-3">
                            <motion.input
                              type="text"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder={`Message ${selectedUserPlant.nickname}...`}
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              disabled={loading}
                              whileFocus={{ scale: 1.01 }}
                            />
                            <motion.button
                              onClick={handleSendMessage}
                              disabled={!message || loading}
                              className={`
                                p-3 rounded-full transition-all
                                ${!message || loading
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-green-500 text-white hover:bg-green-600 shadow-lg'
                                }
                              `}
                              whileHover={!message || loading ? {} : { scale: 1.05 }}
                              whileTap={!message || loading ? {} : { scale: 0.95 }}
                            >
                              <Send className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  ) : (
                    <FadeIn>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-[600px] flex items-center justify-center">
                        <div className="text-center">
                          <FloatingElements>
                            <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
                          </FloatingElements>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a plant to chat</h3>
                          <p className="text-gray-600">Choose one of your plants to start a conversation.</p>
                        </div>
                      </div>
                    </FadeIn>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default EnhancedApp;
