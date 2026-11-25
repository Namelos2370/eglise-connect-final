import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Mode hors ligne + installation : service worker /sw.js (public/sw.js).
// Quand une nouvelle version prend le contrôle, la page se recharge une seule fois.
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (hadController && !reloaded) { reloaded = true; window.location.reload(); }
    });
    navigator.serviceWorker.register('/sw.js').then((reg) => reg.update()).catch(() => {});
  });
}

// Si tu veux mesurer les performances :
reportWebVitals();