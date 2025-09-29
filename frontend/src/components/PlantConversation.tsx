import React, { useState, useEffect, useRef } from 'react';
import { Send, Droplets, Flower, Sparkles, Bot } from 'lucide-react';
import { chatWithPlant, getCareReminder, getPersonalityDemo } from '../api';
import { UserPlant, ChatMessage, ConversationDemo } from '../types';

interface PlantConversationProps {
  userPlants: UserPlant[];
  selectedPlant: UserPlant | null;
  onPlantSelect: (plant: UserPlant) => void;
}

const PlantConversation: React.FC<PlantConversationProps> = ({
  userPlants,
  selectedPlant,
  onPlantSelect,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [demo, setDemo] = useState<ConversationDemo | null>(null);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPlant) {
      loadPersonalityDemo();
      // Add welcome message
      setMessages([
        {
          id: Date.now().toString(),
          type: 'plant',
          message: `Hi there! I'm ${selectedPlant.nickname}, your ${selectedPlant.personality.name} ${selectedPlant.plant_catalog.name}. Let's chat! 🌱`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [selectedPlant]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadPersonalityDemo = async () => {
    if (!selectedPlant) return;
    
    setLoadingDemo(true);
    try {
      const demoData = await getPersonalityDemo(selectedPlant.id);
      setDemo(demoData);
    } catch (error) {
      console.error('Failed to load personality demo:', error);
    } finally {
      setLoadingDemo(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!selectedPlant || !inputMessage.trim() || sending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    try {
      const response = await chatWithPlant(selectedPlant.id, messageToSend);
      
      const plantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'plant',
        message: response.plant_response,
        timestamp: response.timestamp,
      };

      setMessages(prev => [...prev, plantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'plant',
        message: "Sorry, I'm having trouble responding right now. Try again in a moment! 🌱",
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const sendCareReminder = async (taskType: string) => {
    if (!selectedPlant || sending) return;

    setSending(true);
    try {
      const response = await getCareReminder(selectedPlant.id, taskType);
      
      const careMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'care_reminder',
        message: response.message,
        timestamp: response.timestamp,
        task_type: taskType,
      };

      setMessages(prev => [...prev, careMessage]);
    } catch (error) {
      console.error('Failed to get care reminder:', error);
    } finally {
      setSending(false);
    }
  };

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'dramatic': return 'from-purple-500 to-pink-500';
      case 'sarcastic': return 'from-blue-500 to-cyan-500';
      case 'chill': return 'from-green-500 to-emerald-500';
      case 'chatty': return 'from-orange-500 to-yellow-500';
      case 'zen': return 'from-indigo-500 to-purple-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCareIcon = (taskType: string) => {
    switch (taskType) {
      case 'watering': return <Droplets className="w-4 h-4" />;
      case 'fertilizing': return <Flower className="w-4 h-4" />;
      case 'misting': return <Sparkles className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">Chat with Your Plants</h2>
        <p className="mt-2 text-gray-600">Have conversations with your plants and get personalized care reminders</p>
      </div>

      {userPlants.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet!</h3>
          <p className="text-gray-600">Add some plants from the catalog to start chatting with them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Plant Selector */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Your Plants</h3>
              <div className="space-y-2">
                {userPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => onPlantSelect(plant)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedPlant?.id === plant.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 bg-white'
                    }`}
                  >
                    <div className="font-medium text-gray-900">{plant.nickname}</div>
                    <div className="text-sm text-gray-600">{plant.plant_catalog.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{plant.personality.name} personality</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Care Actions */}
            {selectedPlant && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Care Reminders</h3>
                <div className="space-y-2">
                  {['watering', 'fertilizing', 'misting'].map((taskType) => (
                    <button
                      key={taskType}
                      onClick={() => sendCareReminder(taskType)}
                      disabled={sending}
                      className="w-full flex items-center space-x-2 p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {getCareIcon(taskType)}
                      <span className="text-sm capitalize">{taskType}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            {selectedPlant ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
                {/* Chat Header */}
                <div className={`bg-gradient-to-r ${getPersonalityColor(selectedPlant.personality.name)} text-white p-4 rounded-t-lg`}>
                  <h3 className="font-bold text-lg">{selectedPlant.nickname}</h3>
                  <p className="text-sm opacity-90">
                    {selectedPlant.plant_catalog.name} • {selectedPlant.personality.name} personality
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : message.type === 'care_reminder'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.type === 'care_reminder' && (
                          <div className="flex items-center space-x-1 mb-1">
                            {getCareIcon(message.task_type!)}
                            <span className="text-xs font-medium uppercase tracking-wider">
                              {message.task_type} Reminder
                            </span>
                          </div>
                        )}
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 max-w-xs px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse">💭</div>
                          <span className="text-sm">{selectedPlant.nickname} is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${selectedPlant.nickname}...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || sending}
                      className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a plant to chat</h3>
                  <p className="text-gray-600">Choose one of your plants from the sidebar to start a conversation.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlantConversation;
