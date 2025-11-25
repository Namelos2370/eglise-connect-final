import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaCamera } from 'react-icons/fa';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', type: 'Culte'
  });
  const [currentImages, setCurrentImages] = useState([]); 
  const [newFiles, setNewFiles] = useState([]);

  useEffect(() => {
    const fetchEvent = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:3002/events', { headers: { 'Authorization': `Bearer ${token}` } });
            if(res.ok) {
                const events = await res.json();
                const event = events.find(e => e._id === id);
                if(event) {
                    setFormData({
                        title: event.title,
                        description: event.description,
                        date: event.date ? event.date.slice(0, 16) : '', 
                        location: event.location,
                        type: event.type
                    });
                    setCurrentImages(event.images || []);
                }
            }
        } catch(err) { console.error(err); }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    
    // Ajout manuel des champs textes
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('location', formData.location);
    data.append('type', formData.type);
    
    // Ajout des fichiers seulement s'il y en a
    if (newFiles.length > 0) {
        newFiles.forEach(file => data.append('images', file));
    }

    try {
      const res = await fetch(`http://localhost:3002/events/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (res.ok) {
        toast.success('Événement modifié ! ✅');
        navigate('/profile');
      } else {
        const errData = await res.json();
        toast.error(errData.error || errData.message || "Erreur modification");
      }
    } catch (err) { toast.error("Erreur serveur"); }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <button onClick={() => navigate(-1)} style={{ background:'transparent', color:'#666', border:'none', marginBottom:'20px', display:'flex', alignItems:'center', gap:5 }}>
        <FaArrowLeft /> Annuler
      </button>

      <div className="card" style={{ padding:'30px' }}>
        <h2 style={{ textAlign:'center', color:'var(--primary)' }}>Modifier l'événement</h2>
        
        <form onSubmit={handleSubmit}>
            <div style={{ display:'flex', gap:'10px', overflowX:'auto', marginBottom:'15px' }}>
                {currentImages.map((img, idx) => (
                    <img key={idx} src={img} alt="Actuelle" style={{ width:'60px', height:'60px', borderRadius:'5px', objectFit:'cover' }} />
                ))}
            </div>

            <div style={{ marginBottom:'20px', border:'1px dashed #ccc', padding:'10px', borderRadius:'5px', textAlign:'center' }}>
                <label htmlFor="editFile" style={{ cursor:'pointer', color:'var(--primary)', fontWeight:'bold', display:'block' }}>
                    <FaCamera /> Remplacer les images
                </label>
                <input id="editFile" type="file" multiple onChange={e => setNewFiles(Array.from(e.target.files))} style={{ display:'none' }} accept="image/*" />
                {newFiles.length > 0 && <small style={{color:'green'}}>{newFiles.length} fichier(s) sélectionné(s)</small>}
            </div>

            <label>Titre</label>
            <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
            
            <label>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ minHeight:'100px' }} required />
            
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' }}>
                <div><label>Date</label><input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
                <div>
                    <label>Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                        <option>Culte</option><option>Réunion</option><option>Concert</option><option>Fête</option><option>Séminaire</option><option>Autre</option>
                    </select>
                </div>
            </div>

            <label>Lieu</label>
            <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />

            <button type="submit" style={{ marginTop:'20px', width:'100%', display:'flex', justifyContent:'center', alignItems:'center', gap:10 }}>
                <FaSave /> Enregistrer
            </button>
        </form>
      </div>
    </div>
  );
}