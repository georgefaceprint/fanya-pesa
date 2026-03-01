import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Vault from './components/Vault';
import RfqForm from './components/RfqForm';
import AdminPanel from './components/AdminPanel';
import './index.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [authIntent, setAuthIntent] = useState(null);
  const [user, setUser] = useState(null);

  // Auto-detect dark mode and check for existing session
  useEffect(() => {
    document.documentElement.classList.add('dark');
    const storedUser = localStorage.getItem('fanya_pesa_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const navigateTo = (view, intent = null) => {
    setAuthIntent(intent);

    // Simple state simulation for testing
    if (view === 'dashboard' && !user) {
      // Quick mock for testing purposes
      const mockUser = {
        id: "user_" + Math.random().toString(36).substr(2, 9),
        name: "Lindiwe Dlamini",
        email: "lindiwe@cape-logistics.co.za",
        type: intent || "SME",
        industry: [],
        subscribed: false,
        onboardingComplete: false // Start with onboarding incomplete
      };
      setUser(mockUser);
      localStorage.setItem('fanya_pesa_user', JSON.stringify(mockUser));
      setCurrentView('onboarding');
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOnboardingComplete = (data) => {
    const updatedUser = {
      ...user,
      ...data,
      onboardingComplete: true,
      name: data.companyName // Sync company name with user name for UI
    };
    setUser(updatedUser);
    localStorage.setItem('fanya_pesa_user', JSON.stringify(updatedUser));
    setCurrentView('dashboard');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fanya_pesa_user');
    setCurrentView('home');
  };

  return (
    <div className="w-full min-h-screen font-sans">
      {currentView === 'home' && <Home onNavigate={navigateTo} />}
      {currentView === 'auth' && <Auth initialIntent={authIntent} onBack={() => navigateTo('home')} onLogin={(intent) => navigateTo('dashboard', intent)} />}
      {currentView === 'onboarding' && user && <Onboarding user={user} onComplete={handleOnboardingComplete} />}
      {currentView === 'vault' && user && <Vault user={user} onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'rfq-form' && user && <RfqForm user={user} onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'admin-panel' && user && <AdminPanel user={user} onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'dashboard' && user && (
        <Dashboard
          user={user}
          onLogout={logout}
          onNavigate={(view) => setCurrentView(view)}
        />
      )}
    </div>
  );
}
