import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Home from './components/Home';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Vault from './components/Vault';
import RfqForm from './components/RfqForm';
import FundingRequest from './components/FundingRequest';
import Subscription from './components/Subscription';
import ProfileEdit from './components/ProfileEdit';
import AdminPanel from './components/AdminPanel';
import FunderReview from './components/FunderReview';
import StructureDeal from './components/StructureDeal';
import SupplierMilestones from './components/SupplierMilestones';
import FundingDetails from './components/FundingDetails';
import './index.css';

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [authIntent, setAuthIntent] = useState(null);
  const [viewParam, setViewParam] = useState(null); // for passing dealId etc.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.classList.add('dark');

    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        // Fetch profile from Firestore
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Normalize: ensure both .uid and .id always point to Firebase Auth UID
          setUser({ ...authUser, ...userData, uid: authUser.uid, id: authUser.uid });

          if (userData.onboardingComplete) {
            setCurrentView('dashboard');
          } else {
            setCurrentView('onboarding');
          }
        } else {
          // No Firestore doc yet — set both fields
          setUser({ ...authUser, uid: authUser.uid, id: authUser.uid });
        }
      } else {
        setUser(null);
        setCurrentView('home');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navigateTo = (view, intent = null) => {
    if (intent && typeof intent === 'object' && intent.dealId) {
      setViewParam(intent.dealId);
      setAuthIntent(null);
    } else {
      setAuthIntent(intent);
      setViewParam(null);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOnboardingComplete = async (data) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      ...data,
      onboardingComplete: true,
      name: data.companyName
    };

    try {
      await updateDoc(doc(db, "users", user.uid), {
        ...data,
        name: data.companyName,
        onboardingComplete: true
      });
      setUser(updatedUser);
      setCurrentView('dashboard');
    } catch (err) {
      console.error("Onboarding update failed:", err);
      alert("Failed to save onboarding data.");
    }
  };

  const logout = () => {
    signOut(auth);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Fanya Pesa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen font-sans">
      {currentView === 'home' && <Home onNavigate={navigateTo} />}
      {currentView === 'auth' && <Auth initialIntent={authIntent} onBack={() => navigateTo('home')} onLogin={(intent) => navigateTo('dashboard', intent)} />}
      {currentView === 'onboarding' && user && <Onboarding user={user} onComplete={handleOnboardingComplete} />}
      {currentView === 'vault' && user && <Vault user={user} onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'rfq-form' && user && <RfqForm user={user} onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'funding-request' && user && <FundingRequest user={user} onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'subscription' && user && (
        <Subscription
          user={user}
          onBack={() => setCurrentView('dashboard')}
          onSuccess={() => {
            setUser(prev => ({ ...prev, subscribed: true }));
            setCurrentView('dashboard');
          }}
        />
      )}
      {currentView === 'profile-edit' && user && (
        <ProfileEdit
          user={user}
          onBack={() => setCurrentView('dashboard')}
          onSaved={(updatedUser) => {
            setUser(prev => ({ ...prev, ...updatedUser }));
            setCurrentView('dashboard');
          }}
        />
      )}
      {currentView === 'admin-panel' && user && <AdminPanel user={user} onBack={() => setCurrentView('dashboard')} />}
      {currentView === 'funder-review' && user && (
        <FunderReview
          user={user}
          dealId={viewParam}
          onBack={() => setCurrentView('dashboard')}
          onApprove={(deal) => {
            setViewParam(deal.id);
            setCurrentView('structure-deal');
          }}
        />
      )}
      {currentView === 'structure-deal' && user && (
        <StructureDeal
          user={user}
          dealId={viewParam}
          onBack={() => setCurrentView('funder-review')}
          onContractGenerated={() => { }}
        />
      )}
      {currentView === 'supplier-milestones' && user && (
        <SupplierMilestones
          user={user}
          dealId={viewParam}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
      {currentView === 'funding-details' && user && (
        <FundingDetails
          user={user}
          dealId={viewParam}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
      {currentView === 'dashboard' && user && (
        <Dashboard
          user={user}
          onLogout={logout}
          onNavigate={(view, params) => navigateTo(view, params)}
        />
      )}
    </div>
  );
}
