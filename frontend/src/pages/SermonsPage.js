import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaVideo, FaMusic, FaPlus, FaPlayCircle, FaImage, FaSpinner } from 'react-icons/fa';
import Spinner from '../components/Spinner';

export default function SermonsPage() {
  const { user } = useContext(AuthContext);
  const [medias, setMedias] = useState([]);
  const [filter, setFilter] = useState('Tout');
  const [loading, setLoading] = useState(true);
  
  // Formulaire Upload
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Prédication' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchMedias(); }, []);

  const fetchMedias = async () => {
    try {
      const res = await fetch('http://localhost:3002/media');
      if (res.ok) setMedias(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.warning("Fichier requis");
    
    // Vérification taille côté client (sécurité en plus)
    if (file.size > 100 * 1024 * 1024) { // 100 Mo
        return toast.error("Fichier trop volumineux (Max 100Mo)");
    }

    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('file', file);

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3002/media', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data
      });
      if (res.ok) {
        toast.success("Média publié en Story ! 🌟");
        setShowForm(false); setFormData({ title:'', description:'', category:'Prédication' }); setFile(null);
        fetchMedias();
      } else {
        toast.error("Erreur lors de l'envoi (Vérifiez la taille)");
      }
    } catch (err) { toast.error("Erreur serveur"); }
    setUploading(false);
  };

  const filteredMedias = filter === 'Tout' ? medias : medias.filter(m => m.category === filter);

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px' }}>
      
      {/* HEADER AVEC BOUTON AJOUTER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', padding:'0 10px' }}>
        <h2 style={{ margin:0, display:'flex', alignItems:'center', gap:10, color:'var(--secondary)' }}>
            <FaPlayCircle style={{color:'var(--primary)'}} /> Stories
        </h2>
        {user && (
            <button onClick={() => setShowForm(!showForm)} style={{ borderRadius:'30px', padding:'8px 20px', fontSize:'0.9em', display:'flex', alignItems:'center', gap:5 }}>
                <FaPlus /> Ajouter
            </button>
        )}
      </div>

      {/* FORMULAIRE D'UPLOAD (Caché/Visible) */}
      {showForm && (
        <div className="card" style={{ padding:'30px', marginBottom:'30px', borderTop:'4px solid var(--primary)' }}>
            <h3 style={{ marginTop:0 }}>Créer une Story</h3>
            <p style={{fontSize:'0.9em', color:'#666'}}>Partagez une vidéo courte, un audio ou une image inspirante.</p>
            <form onSubmit={handleSubmit}>
                <input placeholder="Titre" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' }}>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Prédication</option><option>Louange</option><option>Témoignage</option><option>Enseignement</option>
                    </select>
                    <input type="file" onChange={e => setFile(e.target.files[0])} accept="video/*,audio/*,image/*" required style={{ paddingTop:'10px' }} />
                </div>
                <textarea placeholder="Description (optionnel)..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <button type="submit" disabled={uploading} style={{ width:'100%', marginTop:'10px', opacity: uploading ? 0.7 : 1, display:'flex', justifyContent:'center', alignItems:'center', gap:10 }}>
                    {uploading ? <><FaSpinner className="fa-spin" /> Envoi en cours...</> : "Publier la Story"}
                </button>
            </form>
        </div>
      )}

      {/* FILTRES (STYLE INSTA) */}
      <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'15px', marginBottom:'10px', paddingLeft:'5px' }}>
        {['Tout', 'Prédication', 'Louange', 'Témoignage', 'Enseignement'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{ 
                background: filter === cat ? 'var(--primary)' : 'white', 
                color: filter === cat ? 'white' : '#666', 
                border: '1px solid #eee', borderRadius:'20px', padding:'6px 15px', fontSize:'0.85em', whiteSpace:'nowrap' 
            }}>
                {cat}
            </button>
        ))}
      </div>

      {/* GRILLE DE STORIES */}
      <div className="stories-grid">
        {filteredMedias.map(media => (
            <div key={media._id} className="story-card">
                
                {/* EN-TÊTE AUTEUR (Superposé) */}
                <div className="story-header">
                    <img src={media.author?.photo || "https://via.placeholder.com/40"} className="story-avatar" alt="User" />
                    <span className="story-author">{media.author?.name}</span>
                </div>

                {/* CONTENU MÉDIA */}
                {media.fileType === 'video' ? (
                    <video src={media.fileUrl} controls className="story-media" playsInline poster="https://via.placeholder.com/300x500/000000/FFFFFF?text=Lecture" />
                ) : media.fileType === 'audio' ? (
                    <div className="story-audio-bg">
                        <FaMusic style={{ fontSize:'4rem', marginBottom:'20px', opacity:0.8 }} />
                        <audio src={media.fileUrl} controls style={{ width:'80%' }} />
                    </div>
                ) : (
                    <img src={media.fileUrl} alt="Story" className="story-media" />
                )}

                {/* OVERLAY TEXTE (Bas) */}
                <div className="story-overlay">
                    <span className="story-category">{media.category}</span>
                    <h3 className="story-title">{media.title}</h3>
                    {media.description && <p className="story-desc">{media.description}</p>}
                </div>
            </div>
        ))}
      </div>
      
      {filteredMedias.length === 0 && <p style={{textAlign:'center', color:'#999', marginTop:'50px'}}>Aucune story pour le moment.</p>}
    </div>
  );
}