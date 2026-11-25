import { useEffect, useState, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import ParishShare from '../components/ParishShare';
import { toast } from 'react-toastify';
import { FaChurch, FaMapMarkerAlt, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import Seo from '../components/Seo';
import Spinner from '../components/Spinner';
import NotFoundPage from './NotFoundPage';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config';

export default function ParishPage() {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invited = searchParams.get('rejoindre') === '1';
  const [parish, setParish] = useState(null);
  const [missing, setMissing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [text, setText] = useState('');

  const load = useCallback(async () => {
    const r = await fetch(`${API_URL}/parishes/${slug}`);
    if (!r.ok) return setMissing(true);
    const p = await r.json();
    setParish(p);
    const [pr, er] = await Promise.all([fetch(`${API_URL}/posts?parish=${p._id}`), fetch(`${API_URL}/events?parish=${p._id}`)]);
    if (pr.ok) setPosts(await pr.json());
    if (er.ok) setEvents(await er.json());
  }, [slug]);

  useEffect(() => { load().catch(() => setMissing(true)); }, [load]);

  const token = () => localStorage.getItem('token');
  const isMine = user && parish && user.parish === parish._id;
  const canManage = user && parish && (user.role === 'admin' || (parish.admins || []).some(a => a._id === user._id));

  const join = async () => {
    if (!user) { try { localStorage.setItem('ec_pending_parish', parish.slug); } catch (e) {} toast.info('Créez un compte ou connectez-vous pour rejoindre cette paroisse.'); return navigate('/signup'); }
    const r = await fetch(`${API_URL}/parishes/${parish._id}/join`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) { toast.success('Bienvenue dans votre paroisse !'); setTimeout(() => window.location.reload(), 600); } else toast.error('Impossible pour le moment.');
  };
  const leave = async () => {
    if (!window.confirm('Quitter cette paroisse ?')) return;
    const r = await fetch(`${API_URL}/parishes/leave/me`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` } });
    if (r.ok) { toast.info('Vous avez quitté la paroisse.'); setTimeout(() => window.location.reload(), 600); }
  };
  const publish = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const fd = new FormData(); fd.append('content', text); fd.append('parishId', parish._id);
    const r = await fetch(`${API_URL}/posts`, { method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: fd });
    if (r.ok) { const c = await r.json().catch(() => ({})); setText(''); if (c.status === 'pending') toast.info('Merci ! Votre publication sera visible après validation par l’administration.', { autoClose: 6000 }); else toast.success('Publié !'); load(); } else toast.error('Erreur');
  };

  if (missing) return <NotFoundPage />;
  if (!parish) return <Spinner />;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <Seo title={parish.name} description={parish.description || `Paroisse ${parish.name} sur Église Connect`} path={`/paroisses/${parish.slug}`} />
      {invited && !isMine && (
        <div className="card" style={{ padding: 15, marginBottom: 15, textAlign: 'center', background: '#fff8e1', border: '1px solid var(--primary)' }}>
          <strong>Vous êtes invité(e) à rejoindre cette paroisse.</strong>
          <div style={{ marginTop: 8 }}><button onClick={join}>Rejoindre maintenant</button></div>
        </div>
      )}
      <div className="card" style={{ padding: 25, textAlign: 'center' }}>
        {parish.logo ? <img src={parish.logo} alt={`Logo ${parish.name}`} width="90" height="90" style={{ borderRadius: 16, objectFit: 'cover' }} />
          : <div style={{ fontSize: '3rem', color: 'var(--primary)' }}><FaChurch /></div>}
        <h1 style={{ margin: '10px 0 5px', color: 'var(--secondary)' }}>{parish.name}</h1>
        <div style={{ color: 'var(--text-light)' }}><FaMapMarkerAlt /> {[parish.quarter, parish.city, parish.country].filter(Boolean).join(', ')} &nbsp; <FaUsers /> {parish.membersCount} membre{parish.membersCount > 1 ? 's' : ''}</div>
        {parish.description && <p style={{ marginTop: 15 }}>{parish.description}</p>}
        <div style={{ marginTop: 15 }}>
          {isMine ? <button className="btn-outline" onClick={leave}>Quitter ma paroisse</button> : <button onClick={join}>Rejoindre cette paroisse</button>}
        </div>
        {canManage && <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Vous gérez cette paroisse.</p>}
      </div>

      <ParishShare parish={parish} />

      <h2 style={{ marginTop: 30 }}><FaCalendarAlt style={{ color: 'var(--primary)' }} /> Événements</h2>
      {events.length === 0 ? <p style={{ color: 'var(--text-light)' }}>Aucun événement annoncé.</p> : events.map(ev => (
        <div key={ev._id} className="card" style={{ padding: 15, marginBottom: 10 }}>
          <strong>{ev.title}</strong><div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{new Date(ev.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {ev.location}</div>
        </div>
      ))}
      {isMine && <p><Link to="/create-event" style={{ color: 'var(--primary)' }}>+ Annoncer un événement</Link></p>}

      <h2 style={{ marginTop: 30 }}>Annonces & publications</h2>
      {isMine && (
        <form onSubmit={publish} className="card" style={{ padding: 15, marginBottom: 15 }}>
          <textarea aria-label="Publier dans la paroisse" value={text} onChange={e => setText(e.target.value)} placeholder="Partagez une annonce avec votre paroisse…" style={{ minHeight: 80 }} />
          <button type="submit">Publier</button>
        </form>
      )}
      {posts.length === 0 ? <p style={{ color: 'var(--text-light)' }}>Aucune publication pour l'instant.</p> : posts.map(p => (
        <div key={p._id} className="card" style={{ padding: 15, marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
            <img src={p.author?.photo || '/avatar.svg'} alt="Photo de l'auteur" width="36" height="36" style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <strong>{p.author?.name}</strong>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{p.content}</p>
          {p.image && <img src={p.image} alt="Image de la publication" style={{ width: '100%', borderRadius: 10, marginTop: 10 }} />}
        </div>
      ))}
    </div>
  );
}
