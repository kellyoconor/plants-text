import React, { useState, useEffect } from 'react';
import { User } from '../types';
import PlantOnboarding from './PlantOnboarding';
import PlantDashboard from './PlantDashboard';
import PlantCatalog from './PlantCatalog';

type AppState = 'onboarding' | 'dashboard' | 'addPlants';

const StreamlinedApp: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in (in a real app, this would check localStorage/session)
  useEffect(() => {
    // For demo purposes, assume user ID 1 exists if they've been through onboarding
    // In production, you'd check localStorage or a session token
    const existingUserId = localStorage.getItem('plantTextsUserId');
    if (existingUserId) {
      // Load user data and go to dashboard
      // For now, we'll just start with onboarding
    }
  }, []);

  const handleOnboardingComplete = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('plantTextsUserId', newUser.id.toString());
    setAppState('dashboard');
  };

  const handleAddMorePlants = () => {
    setAppState('addPlants');
  };

  const handlePlantsAdded = () => {
    setAppState('dashboard');
  };

  if (appState === 'onboarding') {
    return <PlantOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (appState === 'addPlants' && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Add More Plants</h2>
            <button
              onClick={() => setAppState('dashboard')}
              className="text-green-600 hover:text-green-700"
            >
              ← Back to Dashboard
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-xl">
            <PlantCatalog userId={user.id} onPlantAdded={handlePlantsAdded} />
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'dashboard' && user) {
    return <PlantDashboard user={user} onAddMorePlants={handleAddMorePlants} />;
  }

  // Fallback
  return <PlantOnboarding onComplete={handleOnboardingComplete} />;
};

export default StreamlinedApp;

