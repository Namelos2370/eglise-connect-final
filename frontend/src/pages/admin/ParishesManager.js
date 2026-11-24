import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaChurch, FaPlus, FaCheck, FaTimes, FaUserShield, FaCamera } from 'react-icons/fa';
import API_URL from '../../config';

const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });
const json = () => ({ ...auth(), 'Content-Type': 'application/json' });

export default function ParishesManager() {
  const [parishes, setParishes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ name: '', quarter: '', city: '', description: '' });
  const [adminEmail, setAdminEmail] = useState({});

  const load = useCallback(async () => {
    try {
      const [a, b] = await Promise.all([
        fetch(`${API_URL}/parishes/admin/all`, { headers: auth() }),
        fetch(`${API_URL}/parishes/admin/requests`, { headers: auth() })
      ]);
      if (a.ok) setParishes(await a.json());
      if (b.ok) setRequests(await b.json());
    } catch (e) { toast.error('Erreur de chargement'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const call = async (url, method = 'POST', body) => {
    const r = await fetch(`${API_URL}${url}`, { method, headers: body ? json() : auth(), body: body ? JSON.stringify(body) : undefined });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { toast.success(d.message || 'Fait'); load(); return true; }
    toast.error(d.message || d.error || 'Erreur'); return false;
  };

  const create = async (e) => {
    e.preventDefault();
    if (await call('/parishes', 'POST', form)) setForm({ name: '', quarter: '', city: '', description: '' });
  };
  const uploadLogo = async (id, file) => {
    if (!file) return;
    const fd = new FormData(); fd.append('logo', file);
    const r = await fetch(`${API_URL}/parishes/${id}/logo`, { method: 'POST', headers: auth(), body: fd });
    if (r.ok) { toast.success('Logo mis à jour'); load(); } else toast.error("Échec de l'envoi du logo");
  };

  const box = { background: 'white', borderRadius: 12, padding: 20, marginBottom: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' };

  return (
    <div>
      <h1 style={{ color: 'var(--secondary)' }}><FaChurch style={{ color: 'var(--primary)' }} /> Paroisses</h1>

      {requests.length > 0 && (
        <div style={{ ...box, border: '2px solid var(--primary)' }}>
          <h3 style={{ marginTop: 0 }}>Demandes en attente ({requests.length})</h3>
          {requests.map(r => (
            <div key={r._id} style={{ borderTop: '1px solid #eee', padding: '12px 0' }}>
              <strong>{r.name}</strong> — {[r.quarter, r.city].filter(Boolean).join(', ')}
              <div style={{ fontSize: '0.85rem', color: '#555' }}>
                Demandé par {r.requester?.name} ({r.requester?.email}){r.contactPhone && ` · ${r.contactPhone}`}
                {r.contactName && ` · Contact : ${r.contactName}`}
              </div>
              {r.message && <div style={{ fontSize: '0.85rem', marginTop: 4 }}>« {r.message} »</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => call(`/parishes/admin/requests/${r._id}/approve`)}><FaCheck /> Valider</button>
                <button className="btn-outline" onClick={() => call(`/parishes/admin/requests/${r._id}/reject`)}><FaTimes /> Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={create} style={box}>
        <h3 style={{ marginTop: 0 }}><FaPlus /> Ajouter une paroisse</h3>
        <input aria-label="Nom de la paroisse" placeholder="Nom (ex : Paroisse Sainte Marie de Mendong)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input aria-label="Quartier" style={{ flex: 1, minWidth: 140 }} placeholder="Quartier" value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })} />
          <input aria-label="Ville" style={{ flex: 1, minWidth: 140 }} placeholder="Ville" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
        </div>
        <textarea aria-label="Description" placeholder="Description (facultatif)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <button type="submit">Créer la paroisse</button>
      </form>

      {parishes.map(p => (
        <div key={p._id} style={{ ...box, opacity: p.active ? 1 : 0.6 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {p.logo ? <img src={p.logo} alt={`Logo ${p.name}`} width="50" height="50" style={{ borderRadius: 10, objectFit: 'cover' }} /> : <FaChurch size={36} color="#DFA92E" />}
            <div style={{ flex: 1, minWidth: 180 }}>
              <strong>{p.name}</strong> {p.isPilot && <span style={{ fontSize: '0.7rem', background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: 10 }}>PILOTE</span>}
              <div style={{ fontSize: '0.85rem', color: '#666' }}>{[p.quarter, p.city].filter(Boolean).join(', ')} · {p.membersCount} membre(s) · /paroisses/{p.slug}</div>
            </div>
            <label className="btn-outline" style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 5, fontSize: '0.8rem', fontWeight: 'bold' }}>
              <FaCamera /> Logo<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadLogo(p._id, e.target.files[0])} />
            </label>
            <a href={`/paroisses/${p.slug}`} target="_blank" rel="noreferrer" className="btn-outline" style={{ padding: '8px 12px', borderRadius: 5, fontSize: '0.8rem', fontWeight: 'bold', textDecoration: 'none' }}>Lien &amp; QR</a>
            <button className="btn-outline" onClick={() => call(`/parishes/admin/${p._id}/toggle`)}>{p.active ? 'Désactiver' : 'Activer'}</button>
          </div>
          <div style={{ marginTop: 10, fontSize: '0.9rem' }}>
            <FaUserShield /> Responsables :{' '}
            {(p.admins || []).length === 0 ? <em>aucun</em> : p.admins.map(a => (
              <span key={a._id} style={{ background: '#fff8e1', padding: '3px 8px', borderRadius: 10, marginRight: 6, display: 'inline-block' }}>
                {a.name} <span role="button" tabIndex={0} aria-label={`Retirer ${a.name}`} style={{ cursor: 'pointer', color: '#b00' }} onClick={() => call(`/parishes/${p._id}/admins/${a._id}`, 'DELETE')}>×</span>
              </span>
            ))}
          </div>
          <form style={{ display: 'flex', gap: 8, marginTop: 8 }} onSubmit={async e => { e.preventDefault(); if (await call(`/parishes/${p._id}/admins`, 'POST', { email: adminEmail[p._id] })) setAdminEmail({ ...adminEmail, [p._id]: '' }); }}>
            <input type="email" aria-label="Email du responsable" placeholder="Email du nouveau responsable" style={{ margin: 0, flex: 1 }} value={adminEmail[p._id] || ''} onChange={e => setAdminEmail({ ...adminEmail, [p._id]: e.target.value })} required />
            <button type="submit">Nommer</button>
          </form>
        </div>
      ))}
    </div>
  );
}
