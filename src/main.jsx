import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Connected from './Connected.jsx';
import CompleteProfile from './CompleteProfile.jsx';
import Home from './Home.jsx';
// import TherapySessions from './Components/TherapySessions.jsx'; // Removed as per new design
// import LiveChat from './Components/LiveChat.jsx'; // Removed as per new design
import { auth } from './firebase';
import './index.css';

// Placeholder components for new protected routes - no longer needed as content is handled by Home.jsx
// const NotificationsPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1>Notificações</h1></div>;
// const SettingsPage = () => <div className="min-h-screen bg-black text-white flex items-center justify-center"><h1>Configurações</h1></div>;

const rootElement = document.getElementById('root');
const root = rootElement ? createRoot(rootElement) : null;

// Componente para rotas protegidas
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function MainRouter() {
  // Este estado de user e loading já existe dentro de ProtectedRoute, 
  // mas é necessário aqui para decidir entre App e Home na rota raiz.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/connected" element={<Connected />} />
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        
        {/* Rota Raiz - Landing Page para não logados, Home para logados */}
        <Route path="/" element={user ? <Home /> : <App />} />

        {/* Rotas Protegidas - Home é a única rota protegida, seu conteúdo é gerenciado internamente */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        
        {/* Redirecionar qualquer rota desconhecida para a rota principal */}
        <Route path="*" element={user ? <Navigate to="/home" replace /> : <Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

if (root) {
  root.render(
    <StrictMode>
      <MainRouter />
    </StrictMode>
  );
}
