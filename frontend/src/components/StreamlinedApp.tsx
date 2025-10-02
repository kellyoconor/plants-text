import React, { useState, useEffect } from 'react';
import { User } from '../types';
import PlantOnboarding from './PlantOnboarding';
import PlantDashboard from './PlantDashboard';
import PlantCatalog from './PlantCatalog';
import PersonalityTester from './PersonalityTester';

type AppState = 'onboarding' | 'dashboard' | 'addPlants' | 'personalityTester';

const StreamlinedApp: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in (in a real app, this would check localStorage/session)
  useEffect(() => {
    // Check for personality tester URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'personalities') {
      setAppState('personalityTester');
      return;
    }

    // For demo purposes, assume user ID 1 exists if they've been through onboarding
    // In production, you'd check localStorage or a session token
    const existingUserId = localStorage.getItem('plantTextsUserId');
    if (existingUserId) {
      // Load user data and go to dashboard
      // For now, we'll just start with onboarding
      // TODO: Load user data from API and set to dashboard
    }
    
    // Ensure we start with onboarding if no existing user
    if (!existingUserId) {
      setAppState('onboarding');
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

  if (appState === 'personalityTester') {
    return <PersonalityTester />;
  }

  if (appState === 'onboarding') {
    console.log('Rendering PlantOnboarding component');
    return <PlantOnboarding onComplete={handleOnboardingComplete} />;
  }

  if (appState === 'addPlants' && user) {
    return (
      <PlantCatalog 
        userId={user.id} 
        onPlantAdded={handlePlantsAdded}
        onBack={() => setAppState('dashboard')}
      />
    );
  }

  if (appState === 'dashboard' && user) {
    return <PlantDashboard user={user} onAddMorePlants={handleAddMorePlants} />;
  }

  // Fallback
  return <PlantOnboarding onComplete={handleOnboardingComplete} />;
};

export default StreamlinedApp;

