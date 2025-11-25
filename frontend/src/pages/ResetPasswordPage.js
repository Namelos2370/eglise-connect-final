import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:3002/auth/reset-password/${token}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        toast.success("Mot de passe changé ! Connectez-vous.");
        navigate('/login');
      } else { toast.error("Lien invalide ou expiré"); }
    } catch (err) { toast.error("Erreur serveur"); }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding:'20px' }} className="card">
      <h2>Nouveau Mot de Passe</h2>
      <form onSubmit={handleSubmit}>
        <input type="password" placeholder="Nouveau mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Confirmer</button>
      </form>
    </div>
  );
}