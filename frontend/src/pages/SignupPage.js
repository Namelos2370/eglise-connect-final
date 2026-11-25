import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Seo from '../components/Seo';
import { useAntiSpam } from '../utils/antispam';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const { looksLikeBot, Honeypot } = useAntiSpam();

  const { signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) return toast.error('Veuillez saisir votre nom complet.');
    const id = email.trim();
    if (id.includes('@')) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) return toast.error('Adresse email invalide.'); }
    else if (id.replace(/\D/g, '').length < 8) return toast.error('Saisissez un email ou un numéro de téléphone valide (ex : 690 12 34 56).');
    if (password.length < 8) return toast.error('Le mot de passe doit contenir au moins 8 caractères.');
    if (!accepted) return toast.error("Veuillez accepter les CGU et la politique de confidentialité.");
    if (looksLikeBot()) return toast.error('Veuillez réessayer dans un instant.');
    try {
      await signup(name, email, password);
      toast.success('Bienvenue ! 🎉');
      navigate('/feed'); 
    } catch (err) { toast.error('Erreur : ' + err.message); }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <div className="card" style={{ padding: 'clamp(20px, 6vw, 40px)' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary)', marginBottom: '30px' }}>Rejoindre</h2>
        
        <Seo title="Rejoindre la communauté" description="Créez gratuitement votre compte Église Connect et rejoignez la communauté chrétienne en ligne." path="/signup" />
        <form onSubmit={handleSubmit} noValidate>
          <Honeypot />
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <FaUser style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
            <input type="text" aria-label="Nom complet" autoComplete="name" placeholder="Nom complet" value={name} onChange={e => setName(e.target.value)} required style={{ paddingLeft: '45px' }} />
          </div>

          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <FaEnvelope style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
            <input type="text" inputMode="email" aria-label="Email ou téléphone" autoComplete="username" placeholder="Email / téléphone" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: '45px' }} />
          </div>
          
          <div style={{ position: 'relative', marginBottom: '30px' }}>
            <FaLock style={{ position: 'absolute', top: '15px', left: '15px', color: '#aaa' }} />
            <input 
                type={showPassword ? "text" : "password"} aria-label="Mot de passe" autoComplete="new-password" 
                placeholder="Mot de passe (8 car. min)" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required minLength="8"
                style={{ paddingLeft: '45px', paddingRight: '40px' }}
            />
            <span role="button" tabIndex={0} aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                onClick={() => setShowPassword(!showPassword)}
                onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setShowPassword(!showPassword)}
                style={{ position: 'absolute', top: '15px', right: '15px', color: '#aaa', cursor: 'pointer' }}
            >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label style={{ display:'flex', gap:10, alignItems:'flex-start', fontSize:'0.85em', marginBottom:20, color:'var(--text-light)' }}>
            <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} style={{ width:'auto', margin:'3px 0 0' }} />
            <span>J'accepte les <Link to="/terms" style={{ color:'var(--primary)' }}>conditions d'utilisation</Link> et la <Link to="/privacy" style={{ color:'var(--primary)' }}>politique de confidentialité</Link>.</span>
          </label>
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