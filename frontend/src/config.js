const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3002' 
  : 'https://eglise-connect-api.onrender.com'; // On remplacera ça à l'étape 2

export default API_URL;