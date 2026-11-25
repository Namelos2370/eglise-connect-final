import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaMusic, FaPlus, FaPlayCircle, FaSpinner, FaCloudUploadAlt, FaArrowLeft, FaHeart, FaRegHeart, FaRegComment, FaShareAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import API_URL from '../config';

export default function SermonsPage() {
  const { user } = useContext(AuthContext);
  const [medias, setMedias] = useState([]);
  const [filter, setFilter] = useState('Tout');
  const [loading, setLoading] = useState(true);
  
  // MODE CRÉATEUR (TIKTOK STYLE)
  const [showCreator, setShowCreator] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Prédication' });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Pour voir la vidéo/image
  const [uploading, setUploading] = useState(false);
  const [commentFor, setCommentFor] = useState(null); // id du média dont on lit les commentaires
  const [commentText, setCommentText] = useState('');
  const navigate = useNavigate();

  const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` });
  const needLogin = () => { if (!user) { toast.info('Connectez-vous pour interagir.'); navigate('/login'); return true; } return false; };

  const toggleLike = async (m) => {
    if (needLogin()) return;
    const liked = (m.likes || []).includes(user._id);
    setMedias(ms => ms.map(x => x._id === m._id ? { ...x, likes: liked ? x.likes.filter(i => i !== user._id) : [...(x.likes || []), user._id] } : x));
    try {
      const r = await fetch(`${API_URL}/media/${m._id}/like`, { method: 'POST', headers: authH() });
      if (r.ok) { const d = await r.json(); setMedias(ms => ms.map(x => x._id === m._id ? { ...x, likes: d.likes } : x)); }
    } catch (e) { fetchMedias(); }
  };

  const sendComment = async (e) => {
    e.preventDefault();
    if (needLogin() || !commentText.trim()) return;
    try {
      const r = await fetch(`${API_URL}/media/${commentFor}/comment`, { method: 'POST', headers: authH(), body: JSON.stringify({ text: commentText }) });
      if (r.ok) { const d = await r.json(); setMedias(ms => ms.map(x => x._id === commentFor ? { ...x, comments: d.comments } : x)); setCommentText(''); }
      else toast.error('Erreur');
    } catch (err) { toast.error('Erreur'); }
  };

  const shareMedia = async (m) => {
    const url = `${window.location.origin}/sermons`;
    const text = `${m.title} — Église Connect`;
    if (navigator.share) { navigator.share({ title: m.title, text, url }).catch(() => {}); }
    else { try { await navigator.clipboard.writeText(`${text} ${url}`); toast.info('Lien copié !'); } catch (e) { toast.error('Copie impossible'); } }
  };

  useEffect(() => { fetchMedias(); }, []);

  const fetchMedias = async () => {
    try {
      const res = await fetch(`${API_URL}/media`);
      if (res.ok) setMedias(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleFileChange = (e) => {
      const selected = e.target.files[0];
      if (selected) {
          setFile(selected);
          setPreviewUrl(URL.createObjectURL(selected)); // Créer l'aperçu instantané
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.warning("Ajoutez d'abord une vidéo ou un audio !");
    if (file.size > 100 * 1024 * 1024) return toast.error("Fichier trop lourd (Max 100Mo)");

    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('file', file);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/media`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data });
      if (res.ok) { 
          const c = await res.json().catch(() => ({}));
          if (c.status === 'pending') toast.info("Merci ! Votre média sera visible après validation par l’administration.", { autoClose: 6000 }); else toast.success("Publié avec succès ! 🎉"); 
          closeCreator();
          fetchMedias(); 
      } 
      else { const d = await res.json().catch(() => ({})); toast.error(d.message || d.error || "Erreur lors de l'envoi."); }
    } catch (err) { toast.error("Erreur serveur"); }
    setUploading(false);
  };

  const closeCreator = () => {
      setShowCreator(false);
      setFile(null);
      setPreviewUrl(null);
      setFormData({ title: '', description: '', category: 'Prédication' });
  };

  const filteredMedias = filter === 'Tout' ? medias : medias.filter(m => m.category === filter);
  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', paddingBottom:'80px' }}>
      
      {/* --- HEADER PAGE --- */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', padding:'0 10px' }}>
        <h2 style={{ margin:0, display:'flex', alignItems:'center', gap:10, color:'var(--secondary)' }}>
            <FaPlayCircle style={{color:'var(--primary)'}} /> Médias
        </h2>
        {user && (
            <button onClick={() => setShowCreator(true)} className="btn-magic" style={{ padding:'10px 20px', fontSize:'0.9rem' }}>
                <FaPlus /> Créer
            </button>
        )}
      </div>

      {/* --- STUDIO DE CRÉATION (OVERLAY PLEIN ÉCRAN) --- */}
      {showCreator && (
          <div className="creator-overlay">
              <div className="creator-container">
                  
                  {/* Barre du haut */}
                  <div className="creator-header">
                      <button onClick={closeCreator} className="creator-close"><FaArrowLeft /></button>
                      <span style={{fontWeight:'bold'}}>Nouveau Contenu</span>
                      <div style={{width:30}}></div> {/* Espace pour centrer */}
                  </div>

                  {/* Zone de Prévisualisation (Le coeur de l'expérience) */}
                  <div className="creator-preview">
                      {previewUrl ? (
                          file.type.startsWith('video') ? (
                              <video src={previewUrl} controls autoPlay loop className="preview-media" />
                          ) : file.type.startsWith('audio') ? (
                              <div className="preview-audio">
                                  <FaMusic size={50} />
                                  <p>{file.name}</p>
                                  <audio src={previewUrl} controls />
                              </div>
                          ) : (
                              <img src={previewUrl} alt="Aperçu" className="preview-media" />
                          )
                      ) : (
                          <label className="upload-trigger">
                              <FaCloudUploadAlt size={50} color="#666" />
                              <p>Touchez pour ajouter<br/>Vidéo, Audio ou Image</p>
                              <input type="file" onChange={handleFileChange} accept="video/*,audio/*,image/*" hidden />
                          </label>
                      )}
                      
                      {/* Si fichier choisi, bouton pour changer */}
                      {previewUrl && (
                          <label className="change-file-btn">
                              Changer le fichier
                              <input type="file" onChange={handleFileChange} accept="video/*,audio/*,image/*" hidden />
                          </label>
                      )}
                  </div>

                  {/* Formulaire Flottant (Bas) */}
                  <form onSubmit={handleSubmit} className="creator-form">
                      <div className="form-row">
                          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="creator-select">
                              <option>Prédication</option><option>Louange</option><option>Témoignage</option><option>Enseignement</option>
                          </select>
                      </div>
                      
                      <input placeholder="Titre de votre story..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="creator-input title" required />
                      
                      <textarea placeholder="Ajouter une description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="creator-input desc" />

                      <button type="submit" className="creator-submit" disabled={uploading}>
                          {uploading ? <><FaSpinner className="fa-spin" /> Publication en cours...</> : "Publier maintenant"}
                      </button>
                  </form>

              </div>
          </div>
      )}

      {/* --- GRILLE LECTURE (INCHANGÉE) --- */}
      <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'15px', marginBottom:'10px', paddingLeft:'5px' }}>
        {['Tout', 'Prédication', 'Louange', 'Témoignage', 'Enseignement'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{ background: filter === cat ? 'var(--primary)' : '#eee', color: filter === cat ? 'white' : '#666', border: 'none', borderRadius:'20px', padding:'6px 15px', fontSize:'0.85em', whiteSpace:'nowrap', transition:'0.2s', cursor:'pointer' }}>
                {cat}
            </button>
        ))}
      </div>

      {commentFor && (() => {
        const m = medias.find(x => x._id === commentFor);
        if (!m) return null;
        return (
          <div className="comment-sheet-backdrop" onClick={() => setCommentFor(null)}>
            <div className="comment-sheet" onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong>Commentaires ({(m.comments || []).length})</strong>
                <button onClick={() => setCommentFor(null)} aria-label="Fermer" style={{ width: 'auto', background: 'none', color: '#666', padding: 4 }}><FaTimes /></button>
              </div>
              <div className="comment-list">
                {(m.comments || []).length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>Soyez le premier à commenter.</p>}
                {(m.comments || []).map(c => (
                  <div key={c._id} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <img src={c.author?.photo || '/avatar.svg'} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    <div><strong style={{ fontSize: '0.85em' }}>{c.author?.name || 'Membre'}</strong><div style={{ fontSize: '0.95em' }}>{c.text}</div></div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendComment} style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Écrire un commentaire…" maxLength={500} style={{ margin: 0, flex: 1 }} />
                <button type="submit" style={{ width: 'auto', padding: '8px 16px' }}>Envoyer</button>
              </form>
            </div>
          </div>
        );
      })()}

      <div className="stories-grid">
        {filteredMedias.map(media => (
            <div key={media._id} className="story-card">
                <div className="story-header"><img src={media.author?.photo || "/avatar.svg"} className="story-avatar" alt="Photo de l'auteur" /><span className="story-author">{media.author?.name}</span></div>
                {media.fileType === 'video' ? (<video src={media.fileUrl} controls className="story-media" playsInline />) : media.fileType === 'audio' ? (<div className="story-audio-bg"><FaMusic style={{ fontSize:'4rem', marginBottom:'20px', opacity:0.8 }} /><audio src={media.fileUrl} controls style={{ width:'80%' }} /></div>) : (<img src={media.fileUrl} alt="Média partagé" className="story-media" />)}
                <div className="story-actions">
                    <button className="story-action" onClick={() => toggleLike(media)} aria-label="J'aime">
                        {user && (media.likes || []).includes(user._id) ? <FaHeart style={{ color: '#ff4d6d' }} /> : <FaRegHeart />}
                        <span>{(media.likes || []).length}</span>
                    </button>
                    <button className="story-action" onClick={() => setCommentFor(media._id)} aria-label="Commentaires">
                        <FaRegComment /><span>{(media.comments || []).length}</span>
                    </button>
                    <button className="story-action" onClick={() => shareMedia(media)} aria-label="Partager"><FaShareAlt /></button>
                </div>
                <div className="story-overlay"><span className="story-category">{media.category}</span><h3 className="story-title">{media.title}</h3>{media.description && <p className="story-desc">{media.description}</p>}</div>
            </div>
        ))}
      </div>
    </div>
  );
}