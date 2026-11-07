// URL de l'API : configurable via la variable d'environnement REACT_APP_API_URL (Vercel -> Settings -> Environment Variables)
const PROD_API_URL = process.env.REACT_APP_API_URL || 'https://api.eglise-connect.com';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3002'
  : PROD_API_URL.replace(/\/+$/, '');

export default API_URL;
