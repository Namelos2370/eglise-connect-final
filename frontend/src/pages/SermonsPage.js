import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaVideo, FaMusic, FaPlus, FaPlayCircle, FaTimes, FaSpinner, FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';
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
          toast.success("Publié avec succès ! 🎉"); 
          closeCreator();
          fetchMedias(); 
      } 
      else toast.error("Erreur lors de l'envoi.");
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
                              <img src={previewUrl} alt="Preview" className="preview-media" />
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

      <div className="stories-grid">
        {filteredMedias.map(media => (
            <div key={media._id} className="story-card">
                <div className="story-header"><img src={media.author?.photo || "https://via.placeholder.com/40"} className="story-avatar" alt="User" /><span className="story-author">{media.author?.name}</span></div>
                {media.fileType === 'video' ? (<video src={media.fileUrl} controls className="story-media" playsInline />) : media.fileType === 'audio' ? (<div className="story-audio-bg"><FaMusic style={{ fontSize:'4rem', marginBottom:'20px', opacity:0.8 }} /><audio src={media.fileUrl} controls style={{ width:'80%' }} /></div>) : (<img src={media.fileUrl} alt="Story" className="story-media" />)}
                <div className="story-overlay"><span className="story-category">{media.category}</span><h3 className="story-title">{media.title}</h3>{media.description && <p className="story-desc">{media.description}</p>}</div>
            </div>
        ))}
      </div>
    </div>
  );
}