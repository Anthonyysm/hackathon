import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Connected from './Connected.jsx';
import CompleteProfile from './CompleteProfile.jsx';
import Home from './Home.jsx';
import HumorTracker from './Components/HumorTracker.jsx';
import Profile from './Components/Profile.jsx';
import UserProfile from './Components/UserProfile.jsx';
import CommunityGroup from './Components/CommunityGroup.jsx';
import PostDetail from './Components/PostDetail.jsx';
import Notifications from './Components/Notifications.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

const rootElement = document.getElementById('root');
const root = rootElement ? createRoot(rootElement) : null;

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-white ml-3">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="loading-spinner"></div>
        <div className="text-white ml-3">Carregando...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/connected" element={<Connected />} />
      <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
      
      {/* Rota Raiz - Landing Page para não logados, Home para logados */}
      <Route path="/" element={user ? <Home /> : <App />} />

      {/* Rotas Protegidas */}
      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/humortracker" element={<ProtectedRoute><HumorTracker /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/user/:userId" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/community/:groupId" element={<ProtectedRoute><CommunityGroup /></ProtectedRoute>} />
      <Route path="/post/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      
      {/* Redirecionar qualquer rota desconhecida para a rota principal */}
      <Route path="*" element={user ? <Navigate to="/home" replace /> : <Navigate to="/" replace />} />
    </Routes>
  );
}

if (root) {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
