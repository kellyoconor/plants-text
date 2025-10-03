import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUser, getUserPlants } from '../api';
import PlantOnboarding from './PlantOnboarding';
import PlantDashboard from './PlantDashboard';
import PlantCatalog from './PlantCatalog';
import PersonalityTester from './PersonalityTester';

type AppState = 'onboarding' | 'dashboard' | 'addPlants' | 'personalityTester';

const StreamlinedApp: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadExistingUser = async () => {
      // Check for personality tester URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('test') === 'personalities') {
        setAppState('personalityTester');
        return;
      }

      // Check if user is already logged in
      const existingUserId = localStorage.getItem('plantTextsUserId');
      if (existingUserId) {
        try {
          // Load user data from API
          const userData = await getUser(parseInt(existingUserId));
          const userPlants = await getUserPlants(parseInt(existingUserId));
          
          setUser(userData);
          
          // If user has plants, go to dashboard. Otherwise, go to onboarding
          if (userPlants && userPlants.length > 0) {
            setAppState('dashboard');
          } else {
            setAppState('onboarding');
          }
        } catch (error) {
          console.error('Error loading user:', error);
          // If error, clear localStorage and go to onboarding
          localStorage.removeItem('plantTextsUserId');
          setAppState('onboarding');
        }
      } else {
        setAppState('onboarding');
      }
    };

    loadExistingUser();
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
