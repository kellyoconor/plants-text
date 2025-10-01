import React, { useState, useEffect } from 'react';
import { MessageCircle, User, Zap } from 'lucide-react';

interface Plant {
  id: number;
  nickname: string;
  plant_catalog: {
    name: string;
  };
}

interface ChatMessage {
  plant_id: number;
  plant_name: string;
  personality: string;
  user_message: string;
  plant_response: string;
  timestamp: string;
}

const PersonalityTester: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load master user plants
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/users/30/plants')
      .then(res => res.json())
      .then(data => setPlants(data))
      .catch(err => console.error('Failed to load plants:', err));
  }, []);

  const sendMessage = async () => {
    if (!selectedPlant || !message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/plants/${selectedPlant.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const chatResponse: ChatMessage = await response.json();
      setChatHistory(prev => [...prev, chatResponse]);
      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAllPersonalities = async () => {
    const testMessage = "hey how are you doing today?";
    setChatHistory([]);
    
    for (const plant of plants) {
      try {
        const response = await fetch(`http://localhost:8000/api/v1/plants/${plant.id}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: testMessage })
        });

        const chatResponse: ChatMessage = await response.json();
        setChatHistory(prev => [...prev, chatResponse]);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Failed to test ${plant.nickname}:`, err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Plant Personality Tester</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Test all 7 plant personalities with the master user plants. Each plant should have a unique voice and style!
          </p>
          
          <button
            onClick={testAllPersonalities}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg"
          >
            🧪 Test All Personalities
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plant Selection */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Master Test Plants
            </h2>
            
            <div className="space-y-3">
              {plants.map(plant => (
                <button
                  key={plant.id}
                  onClick={() => setSelectedPlant(plant)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    selectedPlant?.id === plant.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{plant.nickname}</div>
                  <div className="text-sm text-gray-600">{plant.plant_catalog.name}</div>
                  <div className="text-xs text-gray-500">Plant ID: {plant.id}</div>
                </button>
              ))}
            </div>

            {/* Individual Chat */}
            {selectedPlant && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Chat with {selectedPlant.nickname}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Chat Results */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-green-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Personality Responses
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations yet. Test a personality to see responses!</p>
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-800">{chat.plant_name}</div>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {chat.personality}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>You:</strong> {chat.user_message}
                    </div>
                    <div className="text-sm text-gray-800 bg-green-50 p-3 rounded-xl">
                      <strong>{chat.plant_name}:</strong> {chat.plant_response}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityTester;
