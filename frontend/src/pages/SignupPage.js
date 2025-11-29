import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
// Import des icônes pour le design pro
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

export default function SignupPage() {
  // États pour stocker ce que l'utilisateur tape
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // On récupère la fonction signup depuis notre "cerveau" AuthContext
  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // On appelle la fonction signup du contexte (qui gère l'API_URL)
      await signup(name, email, password);
      
      // Si tout se passe bien :
      toast.success('Compte créé avec succès ! Bienvenue. 🎉');
      
      // Redirection immédiate vers le Fil d'Actualité
      navigate('/feed'); 
    } catch (err) {
      // Si erreur (ex: email déjà pris), on affiche l'alerte rouge
      toast.error('Erreur : ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <div className="card" style={{ padding: '40px' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '30px' }}>
            Rejoindre la Communauté
        </h2>
        
        <form onSubmit={handleSubmit}>
          
          {/* Champ Nom Complet */}
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
              placeholder="Adresse Email" 
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
              placeholder="Mot de passe (6 car. min)" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength="6"
              style={{ paddingLeft: '45px' }}
            />
          </div>

          {/* Bouton d'action */}
          <button type="submit" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '1.1em' }}>
            <FaUserPlus /> S'inscrire
          </button>
        </form>

        {/* Lien vers Connexion */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9em', color: '#666' }}>
          Déjà membre ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <FaSignInAlt /> Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}