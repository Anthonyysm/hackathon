import React from 'react';
import { useState } from 'react';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import PostCreation from './components/PostCreation';
import SocialFeed from './components/SocialFeed';
import SuggestedGroups from './components/SuggestedGroups';
import MoodTracker from './components/MoodTracker';
import TherapySessions from './components/TherapySessions';
import InteractiveDiary from './components/InteractiveDiary';
import HumorTracker from './components/HumorTracker';
import LiveChat from './components/LiveChat';
import UserOptions from './components/UserOptions';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Debug: Log activeTab changes
  React.useEffect(() => {
    console.log('Active Tab:', activeTab);
  }, [activeTab]);

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
      case 'sessions':
        return <TherapySessions />;
      case 'diary':
        return <InteractiveDiary />;
      case 'humor':
        return <HumorTracker />;
      case 'chat':
        return <LiveChat />;
      case 'options':
        return <UserOptions />;
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
              <MoodTracker />
            </div>
          </aside>
        </>
      );
    }

    return (
      <section className="lg:col-span-12">
        <div className="max-w-4xl mx-auto">
          {renderMainContent()}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-black lg:pb-8 pb-20">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {renderSidebar()}
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;