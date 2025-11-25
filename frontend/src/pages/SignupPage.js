import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// Import des icônes
import { FaUser, FaEnvelope, FaLock, FaUserPlus } from 'react-icons/fa';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      toast.success('Bienvenue dans la communauté ! 🎉');
      navigate('/feed'); // Redirection vers le fil d'actu après inscription
    } catch (err) {
      toast.error('Erreur : ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '30px' }}>Rejoindre</h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* Champ Nom */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <FaUser style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
            <input 
              type="text" 
              placeholder="Nom complet" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              style={{ paddingLeft: '45px' }}
            />
          </div>

          {/* Champ Email */}
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
          
          {/* Champ Mot de passe */}
          <div style={{ position: 'relative', marginBottom: '30px' }}>
            <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
            <input 
              type="password" 
              placeholder="Mot de passe (min. 6 car.)" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ paddingLeft: '45px' }}
            />
          </div>

          <button type="submit" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1.1em' }}>
            <FaUserPlus /> S'inscrire
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em' }}>
          Déjà membre ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Se connecter</Link>
        </div>
      </div>
    </div>
  );
}