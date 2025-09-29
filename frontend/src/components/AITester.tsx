import React, { useState } from 'react';
import { Sparkles, Key, MessageCircle, Droplets, AlertCircle, CheckCircle } from 'lucide-react';
import { testAIPersonality } from '../api';
import { UserPlant } from '../types';

interface AITesterProps {
  userPlants: UserPlant[];
  selectedPlant: UserPlant | null;
  onPlantSelect: (plant: UserPlant) => void;
}

const AITester: React.FC<AITesterProps> = ({ userPlants, selectedPlant, onPlantSelect }) => {
  const [apiKey, setApiKey] = useState('');
  const [testMessage, setTestMessage] = useState('Hi there!');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!selectedPlant || !apiKey.trim()) {
      setError('Please select a plant and enter your OpenAI API key');
      return;
    }

    setTesting(true);
    setError(null);
    setResults(null);

    try {
      const result = await testAIPersonality(selectedPlant.id, apiKey.trim(), testMessage);
      setResults(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to test AI personality');
      console.error('AI test error:', err);
    } finally {
      setTesting(false);
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900">AI Personality Tester</h2>
        <p className="mt-2 text-gray-600">Test real OpenAI integration with your plants' personalities</p>
      </div>

      {userPlants.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet!</h3>
          <p className="text-gray-600">Add some plants from the catalog to test AI personalities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuration Panel */}
          <div className="space-y-6">
            {/* Plant Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Plant</h3>
              <div className="space-y-2">
                {userPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => onPlantSelect(plant)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedPlant?.id === plant.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-gray-900">{plant.nickname}</div>
                        <div className="text-sm text-gray-600">{plant.plant_catalog.name}</div>
                        <div className="text-xs text-gray-500 capitalize mt-1">
                          {plant.personality.name} personality
                        </div>
                      </div>
                      {selectedPlant?.id === plant.id && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* API Configuration */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Key className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">OpenAI Configuration</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is only used for this test and is not stored
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Message
                  </label>
                  <input
                    type="text"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder="Hi there!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={handleTest}
                  disabled={!selectedPlant || !apiKey.trim() || testing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-md hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all"
                >
                  {testing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Testing AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Test AI Personality</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">How to get an OpenAI API key:</h4>
                  <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/api-keys</a></li>
                    <li>Sign up or log in to your OpenAI account</li>
                    <li>Click "Create new secret key"</li>
                    <li>Copy the key and paste it above</li>
                  </ol>
                  <p className="text-xs text-blue-600 mt-2">
                    Note: You'll need credits in your OpenAI account. The test uses ~$0.01 worth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {selectedPlant && (
              <div className={`bg-gradient-to-r ${getPersonalityColor(selectedPlant.personality.name)} text-white rounded-lg p-6`}>
                <h3 className="text-xl font-bold">{selectedPlant.nickname}</h3>
                <p className="opacity-90">{selectedPlant.plant_catalog.name}</p>
                <p className="text-sm opacity-80 capitalize mt-1">
                  {selectedPlant.personality.name} personality
                </p>
                <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3">
                  <p className="text-sm font-medium">Personality Traits:</p>
                  <div className="text-xs mt-1 space-y-1">
                    <div>Tone: {selectedPlant.personality.voice_traits.tone}</div>
                    <div>Emoji usage: {selectedPlant.personality.voice_traits.emoji_usage}</div>
                    <div>Vocabulary: {selectedPlant.personality.voice_traits.vocabulary}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Test Failed</h4>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Results Display */}
            {results && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Test Results</h3>
                </div>

                <div className="space-y-4">
                  {/* Care Reminder */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Care Reminder (AI Generated)</h4>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        {results.test_results.care_reminder}
                      </p>
                    </div>
                  </div>

                  {/* Conversation */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-gray-900">Conversation (AI Generated)</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-end">
                        <div className="bg-blue-500 text-white px-3 py-2 rounded-lg max-w-xs">
                          <p className="text-sm">{results.test_results.conversation.user_message}</p>
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-900 px-3 py-2 rounded-lg max-w-xs">
                          <p className="text-sm">{results.test_results.conversation.plant_response}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-full">
                      <CheckCircle className="w-4 h-4" />
                      <span>AI personality system working perfectly!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Demo Mode Notice */}
            {!results && !error && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="text-center">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Testing Ready</h3>
                  <p className="text-gray-600">
                    Configure your OpenAI API key above to test real AI-generated plant personalities.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Without an API key, plants use pre-written demo responses.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AITester;
