// frontend/src/config.js

const API_URL = window.location.hostname === 'localhost' 
  ? 'https://localhost:3002' 
  : 'https://eglise-api-final.onrender.com'; // <--- REPLACE THIS with your actual Render URL

export default API_URL;