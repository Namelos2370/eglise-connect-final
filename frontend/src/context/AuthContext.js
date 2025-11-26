import { createContext, useState, useEffect } from 'react';
// 1. On importe la configuration
import API_URL from '../config'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 2. On remplace l'ancienne adresse par la variable
      fetch(`${API_URL}/auth/me`, { 
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Token invalide');
      })
      .then(userData => setUser(userData))
      .catch(() => logout());
    } else {
      setLoading(false);
    }
    if(token) setTimeout(() => setLoading(false), 500); 
    else setLoading(false);
  }, []);

  const login = async (email, password) => {
    // 3. Ici aussi
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);
    localStorage.setItem('token', data.token);
    window.location.reload();
  };

  const signup = async (name, email, password) => {
    // 4. Et ici
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