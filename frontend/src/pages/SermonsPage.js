import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaVideo, FaMusic, FaPlus, FaPlayCircle, FaImage, FaSpinner } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import API_URL from '../config'; // <--- IMPORT

export default function SermonsPage() {
  const { user } = useContext(AuthContext);
  const [medias, setMedias] = useState([]);
  const [filter, setFilter] = useState('Tout');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Prédication' });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchMedias(); }, []);

  const fetchMedias = async () => {
    try {
      const res = await fetch(`${API_URL}/media`);
      if (res.ok) setMedias(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.warning("Fichier requis");
    if (file.size > 100 * 1024 * 1024) return toast.error("Fichier trop volumineux (Max 100Mo)");

    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('file', file);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/media`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data });
      if (res.ok) { toast.success("Média publié !"); setShowForm(false); setFormData({ title:'', description:'', category:'Prédication' }); setFile(null); fetchMedias(); } 
      else toast.error("Erreur envoi");
    } catch (err) { toast.error("Erreur serveur"); }
    setUploading(false);
  };

  const filteredMedias = filter === 'Tout' ? medias : medias.filter(m => m.category === filter);
  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', padding:'0 10px' }}>
        <h2 style={{ margin:0, display:'flex', alignItems:'center', gap:10, color:'var(--secondary)' }}><FaPlayCircle style={{color:'var(--primary)'}} /> Stories</h2>
        {user && (<button onClick={() => setShowForm(!showForm)} style={{ borderRadius:'30px', padding:'8px 20px', fontSize:'0.9em', display:'flex', alignItems:'center', gap:5 }}><FaPlus /> Ajouter</button>)}
      </div>
      {showForm && (
        <div className="card" style={{ padding:'30px', marginBottom:'30px', borderTop:'4px solid var(--primary)' }}>
            <form onSubmit={handleSubmit}>
                <input placeholder="Titre" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' }}><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}><option>Prédication</option><option>Louange</option><option>Témoignage</option><option>Enseignement</option></select><input type="file" onChange={e => setFile(e.target.files[0])} accept="video/*,audio/*,image/*" required style={{ paddingTop:'10px' }} /></div>
                <textarea placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                <button type="submit" disabled={uploading} style={{ width:'100%', marginTop:'10px', opacity: uploading ? 0.7 : 1, display:'flex', justifyContent:'center', alignItems:'center', gap:10 }}>{uploading ? <><FaSpinner className="fa-spin" /> Envoi...</> : "Publier"}</button>
            </form>
        </div>
      )}
      <div style={{ display:'flex', gap:'10px', overflowX:'auto', paddingBottom:'15px', marginBottom:'10px', paddingLeft:'5px' }}>{['Tout', 'Prédication', 'Louange', 'Témoignage', 'Enseignement'].map(cat => (<button key={cat} onClick={() => setFilter(cat)} style={{ background: filter === cat ? 'var(--primary)' : 'white', color: filter === cat ? 'white' : '#666', border: '1px solid #eee', borderRadius:'20px', padding:'6px 15px', fontSize:'0.85em', whiteSpace:'nowrap' }}>{cat}</button>))}</div>
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