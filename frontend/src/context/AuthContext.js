import { createContext, useState, useEffect } from 'react';
import API_URL from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérification de session au démarrage
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, { 
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur Auth:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // FONCTION LOGIN AMÉLIORÉE (Sans rechargement de page)
  const login = async (email, password) => {
    // 1. Récupérer le token
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    
    localStorage.setItem('token', data.token);

    // 2. Récupérer immédiatement les infos de l'utilisateur
    const resMe = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` }
    });
    
    if (resMe.ok) {
        const userData = await resMe.json();
        setUser(userData); // Mise à jour immédiate de l'état
        return true; // Succès
    } else {
        throw new Error("Erreur lors de la récupération du profil");
    }
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
    
    // Connexion automatique après inscription
    const resMe = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${data.token}` }
    });
    if (resMe.ok) {
        const userData = await resMe.json();
        setUser(userData);
    }
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