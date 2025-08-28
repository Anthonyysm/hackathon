import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Components/Header';
import WelcomeScreen from './Components/WelcomeScreen';
import PostCreationWithSync from './Components/PostCreationWithSync';
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
import { UserPostsProvider } from './contexts/UserPostsContext';
import Profile from './Components/Profile';
import FloatingParticles from './Components/FloatingParticles';
import LightWaves from './Components/LightWaves';
import CommunityGroups from './Components/CommunityGroups';
import NotificationToast from './Components/NotificationToast';
import PsychologistDashboard from './Components/PsychologistDashboard';
import FriendsList from './Components/FriendsList'; // Import the new FriendsList component

function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [humorDefaultTab, setHumorDefaultTab] = useState('track');
  const [showTour, setShowTour] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const { user, loading, isFirstTime, needsProfileCompletion, markTourAsSeen } = useAuth();
  const navigate = useNavigate();

  // Debug: Log activeTab changes
  useEffect(() => {
    console.log('Active Tab:', activeTab);
  }, [activeTab]);

  // Redirecionar para CompleteProfile se necessário
  useEffect(() => {
    if (!loading && needsProfileCompletion) {
      navigate('/complete-profile');
    }
  }, [loading, needsProfileCompletion, navigate]);

  // Mostrar tour automaticamente na primeira vez
  useEffect(() => {
    if (isFirstTime && !loading && !needsProfileCompletion) {
      setShowTour(true);
    }
  }, [isFirstTime, loading, needsProfileCompletion]);

  // Mostrar mensagem de boas-vindas após o tour ser fechado (apenas na primeira vez)
  useEffect(() => {
    if (showWelcomeMessage && isFirstTime) {
      // A mensagem de boas-vindas será mostrada após o tour ser fechado
      // Não precisamos de timer aqui
    }
  }, [showWelcomeMessage, isFirstTime]);

  const handleStartTour = () => {
    setShowTour(true);
  };

  const handleCloseTour = async () => {
    setShowTour(false);
    
    // Mostrar mensagem de boas-vindas após o tour ser fechado (apenas na primeira vez)
    if (isFirstTime) {
      setShowWelcomeMessage(true);
      await markTourAsSeen();
    }
  };

  const handleCloseWelcomeNotification = () => {
    setShowWelcomeMessage(false);
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
    // Se o usuário for psicólogo e estiver na aba home, mostrar dashboard específico
    if (activeTab === 'home' && user?.role === 'psychologist') {
      return <PsychologistDashboard />;
    }

    switch (activeTab) {
      case 'home':
        return (
          <>
            <WelcomeScreen showWelcomeMessage={showWelcomeMessage} />
            <PostCreationWithSync />
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
        return <HumorTracker defaultTab={humorDefaultTab} />;
      case 'chat':
        return <LiveChat />;
      case 'groups':
        return <CommunityGroups />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      case 'friends': // New case for friends tab
        return <FriendsList />;
      default:
        return (
          <>
            <WelcomeScreen />
            <PostCreationWithSync />
            <SocialFeed />
          </>
        );
    }
  };

  const renderSidebar = () => {
    if (activeTab === 'home') {
      // Se for psicólogo, mostrar apenas o conteúdo principal sem sidebars
      if (user?.role === 'psychologist') {
        return (
          <section className="lg:col-span-12 space-y-8">
            {renderMainContent()}
          </section>
        );
      }

      return (
        <>
          {/* Left Sidebar - Suggested Groups */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <SuggestedGroups setActiveTab={setActiveTab} />
            </div>
          </aside>

          {/* Main Content Area */}
          <section className="lg:col-span-6 space-y-8">
            {renderMainContent()}
          </section>

          {/* Right Sidebar - Mood Tracker */}
          <aside className="lg:col-span-3">
            <div className="sticky top-24">
              <MoodTracker onOpenHumorTab={(tab = 'scheduling') => {
                setHumorDefaultTab(tab);
                setActiveTab('humor');
              }} />
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
    <>
      <LightWaves />
      <UserPostsProvider>
        <div className="min-h-screen bg-black lg:pb-8 pb-20">
          <Header activeTab={activeTab} setActiveTab={setActiveTab} onStartTour={handleStartTour} />
        
          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {renderSidebar()}
            </div>
          </main>

          {/* Welcome Tour - apenas para usuários pela primeira vez */}
          {isFirstTime && (
            <WelcomeTour 
              isOpen={showTour} 
              onClose={handleCloseTour}
              userRole={user?.role || 'cliente'}
              isFirstTime={isFirstTime}
            />
          )}

          {/* Welcome Notification - apenas após o tour ser fechado na primeira vez */}
          {isFirstTime && (
            <NotificationToast
              message="Bem-vindo ao Sereno! 🎉 Estamos felizes em tê-lo conosco nesta jornada de autoconhecimento e bem-estar."
              type="success"
              duration={8000}
              isVisible={showWelcomeMessage}
              onClose={handleCloseWelcomeNotification}
            />
          )}
        </div>
      </UserPostsProvider>
    </>
  );
}

export default Home;