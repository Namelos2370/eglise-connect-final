import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Bon retour parmi nous ! 👋");
      navigate('/feed'); // Redirection vers le fil d'actu
    } catch (err) {
      toast.error("Erreur : " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '30px' }}>Connexion</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <FaEnvelope style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ paddingLeft: '45px' }}
            />
          </div>
          
          <div style={{ position: 'relative', marginBottom: '10px' }}>
            <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ paddingLeft: '45px' }}
            />
          </div>

          {/* --- LE LIEN MANQUANT --- */}
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <Link to="/forgot-password" style={{ color: 'var(--primary)', fontSize: '0.9em', textDecoration: 'none' }}>
              Mot de passe oublié ?
            </Link>
          </div>

          <button type="submit" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1.1em' }}>
            <FaSignInAlt /> Se connecter
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
          Pas encore de compte ? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>S'inscrire</Link>
        </div>
      </div>
    </div>
  );
}