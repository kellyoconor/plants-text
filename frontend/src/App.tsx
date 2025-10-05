import React, { useState, useEffect } from 'react';
import StreamlinedApp from './components/StreamlinedApp';
import LandingPage from './components/LandingPage';
import './App.css';

function App() {
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Check if landing page is explicitly requested via URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('landing') === 'true') {
      setShowLanding(true);
      return;
    }

    // Check if user has already visited or has an account
    const existingUserId = localStorage.getItem('plantTextsUserId');
    const hasVisited = localStorage.getItem('hasVisited');
    
    if (existingUserId || hasVisited) {
      setShowLanding(false);
    }
  }, []);

  const handleGetStarted = () => {
    localStorage.setItem('hasVisited', 'true');
    // Remove landing parameter from URL when entering app
    const url = new URL(window.location.href);
    url.searchParams.delete('landing');
    window.history.replaceState({}, '', url.toString());
    setShowLanding(false);
  };

  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return <StreamlinedApp />;
}

export default App;