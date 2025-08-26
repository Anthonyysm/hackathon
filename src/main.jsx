import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx'; // Re-importando App
import Login from './Login.jsx';
import Register from './Register.jsx';
import Connected from './Connected.jsx';
import CompleteProfile from './CompleteProfile.jsx';
import Home from './Home.jsx';
import { auth } from './firebase'; // Importando auth
import './index.css';

const rootElement = document.getElementById('root');
const root = rootElement ? createRoot(rootElement) : null;

function resolveRoute(hash) {
  switch (hash) {
    case '#/login':
    case '#/auth/login':
      return 'login';
    case '#/register':
    case '#/auth/register':
      return 'register';
    case '#/connected':
      return 'connected';
    case '#/complete-profile':
      return 'complete-profile';
    default:
      return 'home';
  }
}

function RootComponent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const hash = window.location.hash || '#/';
  const route = resolveRoute(hash);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  // Lógica de roteamento
  switch (route) {
    case 'login':
      return <Login />;
    case 'register':
      return <Register />;
    case 'connected':
      return <Connected />;
    case 'complete-profile':
      return <CompleteProfile />;
    case 'home':
    default:
      return user ? <Home /> : <App />;
  }
}

function renderByRoute() {
  if (!root) return;
  root.render(
    <StrictMode>
      <RootComponent />
    </StrictMode>
  );
}

if (root) {
  renderByRoute();
  window.addEventListener('hashchange', renderByRoute);

  // HMR/cleanup safety
  if (import.meta && import.meta.hot) {
    import.meta.hot.dispose(() => {
      window.removeEventListener('hashchange', renderByRoute);
    });
  }
}
