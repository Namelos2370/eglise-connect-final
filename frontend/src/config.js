const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3002' 
  : 'https://eglise-api.onrender.com';

export default API_URL;