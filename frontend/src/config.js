
const PROD_API_URL = 'https://eglise-api.onrender.com';

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3002' 
  : PROD_API_URL;

export default API_URL;