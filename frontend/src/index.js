import './i18n';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration'; // <--- IMPORT DU SERVICE WORKER
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Pour que l'application fonctionne hors-ligne et s'installe comme une app,
// on change unregister() en register().
serviceWorkerRegistration.register(); // <--- C'EST ICI QU'ON ACTIVE LA PWA

// Si tu veux mesurer les performances :
reportWebVitals();