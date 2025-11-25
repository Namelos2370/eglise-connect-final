import { useState } from 'react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3002/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      // On affiche toujours succès par sécurité
      toast.success("Si le compte existe, un lien a été envoyé (Regardez la console serveur)"); 
    } catch (err) { toast.error("Erreur serveur"); }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding:'20px' }} className="card">
      <h2>Récupération</h2>
      <p style={{ textAlign:'center', color:'#666' }}>Entrez votre email pour recevoir un lien de réinitialisation.</p>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Votre email" value={email} onChange={e => setEmail(e.target.value)} required />
        <button type="submit">Envoyer le lien</button>
      </form>
      <div style={{ textAlign:'center', marginTop:'20px' }}><Link to="/login">Retour connexion</Link></div>
    </div>
  );
}