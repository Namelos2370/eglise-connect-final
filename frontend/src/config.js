const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3002' 
  : 'https://eglise-api.onrender.com'; // <--- VÉRIFIE QUE C'EST BIEN TON LIEN RENDER ICI

export default API_URL;