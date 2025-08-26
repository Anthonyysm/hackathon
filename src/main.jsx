import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Connected from './Connected.jsx';
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
    default:
      return 'home';
  }
}

function renderByRoute() {
  if (!root) return;
  const hash = window.location.hash || '#/';
  const route = resolveRoute(hash);
  root.render(
    <StrictMode>
      {route === 'login' ? <Login /> : route === 'register' ? <Register /> : route === 'connected' ? <Connected /> : <App />}
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
