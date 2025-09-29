import React, { useState, useEffect } from 'react';
import { Calendar, Droplets, Flower, Sparkles, RefreshCw } from 'lucide-react';
import { getUserDashboard, completeCareTask } from '../api';
import { UserPlant } from '../types';

interface UserDashboardProps {
  userId: number;
  userPlants: UserPlant[];
  onRefresh: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userId, userPlants, onRefresh }) => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completingCare, setCompletingCare] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getUserDashboard(userId);
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCare = async (userPlantId: number, taskType: string) => {
    const key = `${userPlantId}-${taskType}`;
    setCompletingCare(key);
    
    try {
      await completeCareTask({
        user_plant_id: userPlantId,
        task_type: taskType,
        method: 'manual',
        notes: `Completed via web interface`
      });
      
      // Refresh data
      await loadDashboard();
      onRefresh();
      
    } catch (error) {
      console.error('Failed to complete care task:', error);
      alert('Failed to log care completion. Please try again.');
    } finally {
      setCompletingCare(null);
    }
  };

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'dramatic': return 'border-purple-200 bg-purple-50';
      case 'sarcastic': return 'border-blue-200 bg-blue-50';
      case 'chill': return 'border-green-200 bg-green-50';
      case 'chatty': return 'border-orange-200 bg-orange-50';
      case 'zen': return 'border-indigo-200 bg-indigo-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getCareIcon = (taskType: string) => {
    switch (taskType) {
      case 'watering': return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'fertilizing': return <Flower className="w-5 h-5 text-green-600" />;
      case 'misting': return <Sparkles className="w-5 h-5 text-purple-600" />;
      default: return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">My Plant Dashboard</h2>
          <p className="mt-2 text-gray-600">Keep track of your plants and their care schedules</p>
        </div>
        <button
          onClick={() => { loadDashboard(); onRefresh(); }}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {userPlants.length === 0 ? (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No plants yet!</h3>
          <p className="text-gray-600">Add some plants from the catalog to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plants Overview */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Plant Collection</h3>
            
            {userPlants.map((plant) => (
              <div
                key={plant.id}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 ${getPersonalityColor(plant.personality.name)}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{plant.nickname}</h4>
                    <p className="text-gray-600">{plant.plant_catalog.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{plant.personality.name} personality</p>
                  </div>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border">
                    {plant.plant_catalog.difficulty_level}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <Droplets className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Watering</p>
                    <p className="text-xs text-gray-600">
                      Every {plant.plant_catalog.care_requirements.watering_frequency_days} days
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <Flower className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Fertilizing</p>
                    <p className="text-xs text-gray-600">
                      Every {plant.plant_catalog.care_requirements.fertilizing_frequency_days} days
                    </p>
                  </div>
                  
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900">Light</p>
                    <p className="text-xs text-gray-600 capitalize">
                      {plant.plant_catalog.care_requirements.light_level}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Care Schedule */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Care</h3>
              
              {dashboard?.upcoming_care?.length > 0 ? (
                <div className="space-y-3">
                  {dashboard.upcoming_care.slice(0, 5).map((care: any) => {
                    const plant = userPlants.find(p => p.id === care.user_plant_id);
                    if (!plant) return null;
                    
                    const isOverdue = new Date(care.next_due) < new Date();
                    const careKey = `${care.user_plant_id}-${care.task_type}`;
                    
                    return (
                      <div
                        key={care.id}
                        className={`p-3 rounded-lg border-2 ${
                          isOverdue 
                            ? 'border-red-200 bg-red-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getCareIcon(care.task_type)}
                            <div>
                              <p className="font-medium text-gray-900">{plant.nickname}</p>
                              <p className="text-sm text-gray-600 capitalize">{care.task_type}</p>
                              <p className={`text-xs ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                                {isOverdue ? 'Overdue' : formatTimeAgo(care.next_due)}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleCompleteCare(care.user_plant_id, care.task_type)}
                            disabled={completingCare === careKey}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              isOverdue
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            } disabled:opacity-50`}
                          >
                            {completingCare === careKey ? 'Logging...' : 'Done'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming care tasks</p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Plants</span>
                  <span className="font-semibold text-gray-900">{userPlants.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Care Tasks Due</span>
                  <span className="font-semibold text-red-600">
                    {dashboard?.upcoming_care?.filter((care: any) => new Date(care.next_due) < new Date()).length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">This Week</span>
                  <span className="font-semibold text-green-600">
                    {dashboard?.upcoming_care?.filter((care: any) => {
                      const careDate = new Date(care.next_due);
                      const weekFromNow = new Date();
                      weekFromNow.setDate(weekFromNow.getDate() + 7);
                      return careDate <= weekFromNow;
                    }).length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
