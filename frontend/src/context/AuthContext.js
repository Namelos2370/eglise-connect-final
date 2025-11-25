// frontend/src/context/AuthContext.js
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // URL de base stable (évite les bugs localhost)
  const API_URL = 'http://127.0.0.1:3002/auth';

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          logout(); // Token invalide ou expiré
        }
      } catch (err) {
        console.error("Erreur connexion auto:", err);
        // Ne pas déconnecter tout de suite si c'est juste une erreur réseau temporaire
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Erreur de connexion');
      
      localStorage.setItem('token', data.token);
      
      // Mise à jour immédiate de l'état sans recharger la page (plus rapide)
      await checkUserLoggedIn(); 
      
      return true; // Succès
    } catch (err) {
      throw err; // Renvoie l'erreur au formulaire pour l'afficher
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Erreur d'inscription");
      
      localStorage.setItem('token', data.token);
      await checkUserLoggedIn();
      
      return true;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login'; // Redirection forcée propre
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};