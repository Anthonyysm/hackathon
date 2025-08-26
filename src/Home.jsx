import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import PostCreation from './components/PostCreation';
import SocialFeed from './components/SocialFeed';
import SuggestedGroups from './components/SuggestedGroups';
import MoodTracker from './components/MoodTracker';
import TherapySessions from './components/TherapySessions.jsx'; // Re-adding import
import InteractiveDiary from './components/InteractiveDiary'; // Re-adding import
import HumorTracker from './Components/HumorTracker.jsx'; // Re-adding import
import LiveChat from './components/LiveChat'; // Re-adding import
import UserOptions from './components/UserOptions'; // Re-adding import
import Settings from './components/Settings'; // Re-adding import
import WelcomeTour from './components/WelcomeTour'; // Re-adding import
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [showTour, setShowTour] = useState(false);
  const [user, setUser] = useState(null);

  // Debug: Log activeTab changes
  useEffect(() => {
    console.log('Active Tab:', activeTab);
  }, [activeTab]);

  const handleStartTour = () => {
    setShowTour(true);
  };

  // Fetch user data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser({ ...currentUser, role: userSnap.data().role });
          } else {
            setUser(currentUser);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

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
      case 'notifications': // Placeholder for notifications content
        return <div className="text-white">Conteúdo de Notificações</div>;
      case 'settings': // Settings component
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