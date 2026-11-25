import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes } from 'react-icons/fa';
import API_URL from '../../config';

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export default function ModerationQueue() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/admin/moderation`, { headers: headers() });
      if (r.ok) setData(await r.json()); else toast.error('Erreur de chargement');
    } catch (e) { toast.error('Erreur de chargement'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (type, id, action) => {
    const r = await fetch(`${API_URL}/admin/moderation/${type}/${id}/${action}`, { method: 'POST', headers: headers() });
    const d = await r.json().catch(() => ({}));
    if (r.ok) { toast.success(d.message); load(); window.dispatchEvent(new Event('moderation-changed')); }
    else toast.error(d.message || 'Erreur');
  };

  if (!data) return <p>Chargement…</p>;

  const items = [
    ...data.posts.map(x => ({ type: 'posts', label: 'Publication', who: x.author, at: x.createdAt, x, text: x.content, img: x.image })),
    ...data.events.map(x => ({ type: 'events', label: 'Événement', who: x.organizer, at: x.createdAt, x, text: `${x.title} — ${x.location} (${new Date(x.date).toLocaleDateString('fr-FR')})\n${x.description}`, img: x.images && x.images[0] })),
    ...data.prayers.map(x => ({ type: 'prayers', label: 'Prière', who: x.isAnonymous ? { name: 'Anonyme (visible de l’admin : ' + (x.author?.name || '?') + ')' } : x.author, at: x.createdAt, x, text: x.content })),
    ...data.medias.map(x => ({ type: 'media', label: x.fileType === 'video' ? 'Vidéo' : x.fileType === 'audio' ? 'Audio' : 'Média', who: x.author, at: x.createdAt, x, text: `${x.title}${x.description ? '\n' + x.description : ''}`, file: x }))
  ].sort((a, b) => new Date(a.at) - new Date(b.at));

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>À valider {items.length > 0 && `(${items.length})`}</h1>
      <p style={{ color: '#666' }}>Rien n’est publié tant que vous n’avez pas approuvé. Les contenus des administrateurs sont publiés directement.</p>
      {items.length === 0 && <div className="card" style={{ padding: 30, textAlign: 'center' }}>Aucun contenu en attente. 🙏</div>}
      {items.map(it => (
        <div key={it.type + it.x._id} className="card" style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, fontSize: '0.85rem', color: '#666' }}>
            <strong style={{ color: 'var(--primary)' }}>{it.label}</strong>
            <span>{it.who?.name || 'Inconnu'} · {new Date(it.at).toLocaleString('fr-FR')}</span>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', margin: '10px 0' }}>{it.text}</p>
          {it.img && <img src={it.img} alt="" style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 10 }} />}
          {it.file && it.file.fileType === 'video' && <video src={it.file.fileUrl} controls style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 10 }} />}
          {it.file && it.file.fileType === 'audio' && <audio src={it.file.fileUrl} controls style={{ width: '100%' }} />}
          {it.file && it.file.fileType === 'image' && <img src={it.file.fileUrl} alt="" style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 10 }} />}
          {it.file && it.file.fileType === 'document' && <a href={it.file.fileUrl} target="_blank" rel="noreferrer">Ouvrir le document</a>}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button onClick={() => act(it.type, it.x._id, 'approve')} style={{ flex: 1, background: '#16a34a' }}><FaCheck /> Approuver</button>
            <button onClick={() => { if (window.confirm('Refuser ce contenu ?')) act(it.type, it.x._id, 'reject'); }} style={{ flex: 1, background: '#dc2626' }}><FaTimes /> Refuser</button>
          </div>
        </div>
      ))}
    </div>
  );
}
