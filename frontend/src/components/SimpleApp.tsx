import React, { useState, useEffect } from 'react';
import { Leaf, MessageCircle, Send } from 'lucide-react';
import { getPlantCatalog, getUserPlants, addPlantToUser, chatWithPlant, getCareReminder } from '../api';
import { Plant, UserPlant } from '../types';

const SimpleApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState('catalog');
  const [plants, setPlants] = useState<Plant[]>([]);
  const [userPlants, setUserPlants] = useState<UserPlant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [selectedUserPlant, setSelectedUserPlant] = useState<UserPlant | null>(null);
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlants();
    loadUserPlants();
  }, []);

  const loadPlants = async () => {
    try {
      const data = await getPlantCatalog();
      setPlants(data.slice(0, 10)); // Show first 10 for demo
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
      alert(`${nickname} added successfully! 🌱`);
    } catch (error) {
      console.error('Failed to add plant:', error);
      alert('Failed to add plant');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUserPlant || !message) return;

    const userMsg = { type: 'user', message, time: new Date().toLocaleTimeString() };
    setChatMessages(prev => [...prev, userMsg]);
    
    const msgToSend = message;
    setMessage('');
    setLoading(true);

    try {
      const response = await chatWithPlant(selectedUserPlant.id, msgToSend);
      const plantMsg = { 
        type: 'plant', 
        message: response.plant_response, 
        time: new Date().toLocaleTimeString() 
      };
      setChatMessages(prev => [...prev, plantMsg]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCareReminder = async (taskType: string) => {
    if (!selectedUserPlant) return;

    setLoading(true);
    try {
      const response = await getCareReminder(selectedUserPlant.id, taskType);
      const careMsg = { 
        type: 'care', 
        message: response.message, 
        time: new Date().toLocaleTimeString(),
        taskType 
      };
      setChatMessages(prev => [...prev, careMsg]);
    } catch (error) {
      console.error('Failed to get care reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <Leaf style={{ color: '#16a34a' }} size={32} />
          <h1 style={{ margin: 0, color: '#1f2937', fontSize: '28px' }}>Plant Texts MVP</h1>
        </div>
        <p style={{ color: '#6b7280', margin: 0 }}>Give your plants a personality!</p>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', justifyContent: 'center' }}>
        <button
          onClick={() => setActiveTab('catalog')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'catalog' ? '#16a34a' : '#e5e7eb',
            color: activeTab === 'catalog' ? 'white' : '#374151',
          }}
        >
          Plant Catalog
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: activeTab === 'chat' ? '#16a34a' : '#e5e7eb',
            color: activeTab === 'chat' ? 'white' : '#374151',
          }}
        >
          Chat with Plants
        </button>
      </div>

      {/* Plant Catalog Tab */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div>
            <h2 style={{ marginBottom: '20px' }}>Available Plants</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => setSelectedPlant(plant)}
                  style={{
                    padding: '15px',
                    border: selectedPlant?.id === plant.id ? '2px solid #16a34a' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: 'white',
                  }}
                >
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{plant.name}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#6b7280', fontStyle: 'italic' }}>{plant.species}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    💧 Every {plant.care_requirements.watering_frequency_days} days • 
                    ☀️ {plant.care_requirements.light_level} light
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              {selectedPlant ? (
                <div>
                  <h3>{selectedPlant.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>{selectedPlant.description}</p>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '500' }}>
                      Plant Name:
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g., Fernando, Drama Queen"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <button
                    onClick={handleAddPlant}
                    disabled={!nickname || loading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: !nickname || loading ? '#9ca3af' : '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: !nickname || loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? 'Adding...' : 'Add Plant'}
                  </button>
                </div>
              ) : (
                <p style={{ color: '#6b7280', textAlign: 'center' }}>Select a plant to add to your collection</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div>
            <h3>Your Plants</h3>
            {userPlants.length === 0 ? (
              <p style={{ color: '#6b7280' }}>No plants yet! Add some from the catalog.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {userPlants.map((plant) => (
                  <button
                    key={plant.id}
                    onClick={() => { setSelectedUserPlant(plant); setChatMessages([]); }}
                    style={{
                      padding: '15px',
                      border: selectedUserPlant?.id === plant.id ? '2px solid #16a34a' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ fontWeight: '500' }}>{plant.nickname}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{plant.plant_catalog.name}</div>
                    <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'capitalize' }}>
                      {plant.personality.name} personality
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedUserPlant && (
              <div style={{ marginTop: '20px' }}>
                <h4>Quick Care Reminders</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {['watering', 'fertilizing', 'misting'].map((task) => (
                    <button
                      key={task}
                      onClick={() => handleCareReminder(task)}
                      disabled={loading}
                      style={{
                        padding: '8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        backgroundColor: 'white',
                        textTransform: 'capitalize',
                      }}
                    >
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {selectedUserPlant ? (
              <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', height: '500px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)', 
                  color: 'white', 
                  padding: '15px', 
                  borderRadius: '8px 8px 0 0' 
                }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{selectedUserPlant.nickname}</h3>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                    {selectedUserPlant.plant_catalog.name} • {selectedUserPlant.personality.name} personality
                  </p>
                </div>

                <div style={{ flex: 1, padding: '15px', overflowY: 'auto', backgroundColor: '#f9fafb' }}>
                  {chatMessages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#6b7280', marginTop: '50px' }}>
                      <MessageCircle size={48} style={{ marginBottom: '10px' }} />
                      <p>Start a conversation with {selectedUserPlant.nickname}!</p>
                    </div>
                  )}
                  
                  {chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '10px',
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: '8px 12px',
                          borderRadius: '12px',
                          backgroundColor: msg.type === 'user' ? '#3b82f6' : msg.type === 'care' ? '#fbbf24' : 'white',
                          color: msg.type === 'user' ? 'white' : '#374151',
                          border: msg.type !== 'user' ? '1px solid #e5e7eb' : 'none',
                        }}
                      >
                        <p style={{ margin: '0 0 5px 0', fontSize: '14px' }}>{msg.message}</p>
                        <p style={{ margin: 0, fontSize: '10px', opacity: 0.7 }}>{msg.time}</p>
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ backgroundColor: 'white', padding: '8px 12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: '14px' }}>{selectedUserPlant.nickname} is thinking...</span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '15px', borderTop: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Message ${selectedUserPlant.nickname}...`}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                      }}
                      disabled={loading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!message || loading}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: !message || loading ? '#9ca3af' : '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: !message || loading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb', 
                height: '500px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <div>
                  <MessageCircle size={48} style={{ color: '#9ca3af', marginBottom: '10px' }} />
                  <p style={{ color: '#6b7280' }}>Select a plant to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleApp;
