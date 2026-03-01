import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Auth from './components/Auth';
import './index.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [authIntent, setAuthIntent] = useState(null);

  // Example dark mode toggle. Defaulting to dark mode to match user preference.
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const navigateTo = (view, intent = null) => {
    setAuthIntent(intent);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen font-sans">
      {currentView === 'home' && <Home onNavigate={navigateTo} />}
      {currentView === 'auth' && <Auth initialIntent={authIntent} onBack={() => navigateTo('home')} />}
    </div>
  );
}
