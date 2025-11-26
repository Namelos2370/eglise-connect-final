// frontend/src/config.js

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3002' 
  : 'https://eglise-api-final.onrender.com';

export default API_URL;