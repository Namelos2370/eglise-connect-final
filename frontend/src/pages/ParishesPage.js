import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaChurch, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import Seo from '../components/Seo';
import Spinner from '../components/Spinner';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config';

export default function ParishesPage() {
  const { user } = useContext(AuthContext);
  const [parishes, setParishes] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/parishes`).then(r => r.ok ? r.json() : []).then(setParishes).catch(() => setParishes([]));
  }, []);

  if (!parishes) return <Spinner />;
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
      <Seo title="Paroisses" description="Découvrez les paroisses du réseau Église Connect et rejoignez la vôtre : annonces, événements et prières." path="/paroisses" />
      <h1 style={{ color: 'var(--secondary)', textAlign: 'center' }}><FaChurch style={{ color: 'var(--primary)' }} /> Réseau des paroisses</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: 30 }}>Rejoignez votre paroisse pour suivre ses annonces, ses événements et sa vie communautaire.</p>
      {parishes.length === 0 && <p style={{ textAlign: 'center' }}>Aucune paroisse pour le moment.</p>}
      <div style={{ display: 'grid', gap: 15 }}>
        {parishes.map(p => (
          <Link key={p._id} to={`/paroisses/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card" style={{ padding: 20, display: 'flex', gap: 15, alignItems: 'center' }}>
              {p.logo ? <img src={p.logo} alt={`Logo ${p.name}`} width="60" height="60" style={{ borderRadius: 12, objectFit: 'cover' }} />
                : <div style={{ width: 60, height: 60, borderRadius: 12, background: '#fff8e1', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem' }}><FaChurch /></div>}
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{p.name} {p.isPilot && <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 10, verticalAlign: 'middle' }}>PILOTE</span>}</h3>
                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginTop: 4 }}>
                  <FaMapMarkerAlt /> {[p.quarter, p.city].filter(Boolean).join(', ')} &nbsp; <FaUsers /> {p.membersCount} membre{p.membersCount > 1 ? 's' : ''}
                </div>
                {user && user.parish === p._id && <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', marginTop: 4 }}>✓ Ma paroisse</div>}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
