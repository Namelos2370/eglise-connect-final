import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⚠️ METS ICI TON VRAI LIEN RENDER (celui que tu as copié tout à l'heure)
  // Exemple : https://eglise-api.onrender.com
  // Ne mets PAS de slash à la fin.
  const API_URL = "https://eglise-api.onrender.com"; 

  useEffect(() => {
    console.log("🔍 AuthContext chargé. API cible :", API_URL); // Pour vérifier dans la console

    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/auth/me`, { 
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Token invalide');
      })
      .then(userData => {
        console.log("✅ Utilisateur connecté :", userData.email);
        setUser(userData);
      })
      .catch(() => {
        console.log("❌ Token invalide, déconnexion.");
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    if(token) setTimeout(() => setLoading(false), 500);
  }, []);

  const login = async (email, password) => {
    console.log("🚀 Tentative de connexion vers :", `${API_URL}/auth/login`);
    
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    
    console.log("✅ Connexion réussie !");
    localStorage.setItem('token', data.token);
    window.location.reload();
  };

  const signup = async (name, email, password) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('token', data.token);
    window.location.reload();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};