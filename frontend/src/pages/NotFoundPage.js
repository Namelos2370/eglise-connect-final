import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 520, margin: '0 auto' }}>
      <Seo title="Page introuvable" noindex />
      <img src="/logo192.png" alt="Logo Église Connect" width="96" height="96" style={{ borderRadius: 20 }} />
      <h1 style={{ fontSize: '4rem', margin: '10px 0 0', color: 'var(--primary)' }}>404</h1>
      <h2 style={{ color: 'var(--secondary)' }}>Cette page est introuvable</h2>
      <p style={{ color: 'var(--text-light)' }}>Le lien est peut-être incorrect ou la page a été déplacée. Revenez à l'accueil ou rejoignez la communauté.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 }}>
        <Link to="/"><button>Retour à l'accueil</button></Link>
        <Link to="/events"><button className="btn-outline">Voir les événements</button></Link>
      </div>
    </div>
  );
}
