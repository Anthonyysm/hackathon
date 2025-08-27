import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import WelcomeScreen from './Components/WelcomeScreen';
import PostCreation from './Components/PostCreation';
import SocialFeed from './Components/SocialFeed';
import SuggestedGroups from './Components/SuggestedGroups';
import MoodTracker from './Components/MoodTracker';
import TherapySessions from './Components/TherapySessions';
import InteractiveDiary from './Components/InteractiveDiary';
import HumorTracker from './Components/HumorTracker';
import LiveChat from './Components/LiveChat';
import Settings from './Components/Settings';
import Notifications from './Components/Notifications';
import WelcomeTour from './Components/WelcomeTour';
import { useAuth } from './contexts/AuthContext';
import Profile from './Components/Profile';

function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [showTour, setShowTour] = useState(false);
  const { user, loading } = useAuth();

  // Debug: Log activeTab changes
  useEffect(() => {
    console.log('Active Tab:', activeTab);
  }, [activeTab]);

  const handleStartTour = () => {
    setShowTour(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-white ml-3">Carregando...</div>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <WelcomeScreen />
            <PostCreation />
            <SocialFeed />
          </>
        );
      case 'profile':
        return <Profile />;
      case 'sessions':
        return <TherapySessions />;
      case 'diary':
        return <InteractiveDiary />;
      case 'humor':
        return <HumorTracker />;
      case 'chat':
        return <LiveChat />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <>
            <WelcomeScreen />
            <PostCreation />
            <SocialFeed />
          </>
        );
    }
  };

  const renderSidebar = () => {
    if (activeTab === 'home') {
      return (
        <>
          {/* Left Sidebar - Suggested Groups */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <SuggestedGroups />
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="lg:col-span-6 space-y-8">
            {renderMainContent()}
          </section>

          {/* Right Sidebar - Mood Tracker */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <MoodTracker onOpenHumorTab={() => setActiveTab('humor')} />
            </div>
          </aside>
        </>
      );
    } else if (activeTab === 'profile') {
      return (
        <section className="lg:col-span-12">
          <div className="max-w-6xl mx-auto">
            {renderMainContent()}
          </div>
        </section>
      );
    } else {
      return (
        <section className="lg:col-span-12">
          <div className="max-w-4xl mx-auto">
            {renderMainContent()}
          </div>
        </section>
      );
    }
  };

  return (
    <div className="min-h-screen bg-black lg:pb-8 pb-20">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} onStartTour={handleStartTour} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {renderSidebar()}
        </div>
      </main>

      {/* Welcome Tour */}
      <WelcomeTour 
        isOpen={showTour} 
        onClose={() => setShowTour(false)}
        userRole={user?.role || 'cliente'}
      />
    </div>
  );
}

export default Home;