import { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCamera, FaCalendarPlus, FaMapMarkerAlt, FaAlignLeft } from 'react-icons/fa';
import API_URL from '../config';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = !!id;
  const [existingImages, setExistingImages] = useState([]);
  const { user } = useContext(AuthContext);
  const [forParish, setForParish] = useState(true);
  
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', type: 'Culte'
  });
  const [files, setFiles] = useState([]); // Tableau de fichiers
  const [previews, setPreviews] = useState([]); // Pour afficher les miniatures

  useEffect(() => {
    if (!editing) return;
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/events/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(ev => {
        const d = new Date(ev.date); const pad = n => String(n).padStart(2, '0');
        const local = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setFormData({ title: ev.title || '', description: ev.description || '', date: local, location: ev.location || '', type: ev.type || 'Culte' });
        setExistingImages(ev.images || []);
      })
      .catch(() => { toast.error("Événement introuvable ou non autorisé"); navigate('/events'); });
  }, [id, editing, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    // Convertir FileList en Array
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    // Créer les URLs pour la prévisualisation
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editing && files.length === 0) {
        return toast.warning("Veuillez ajouter au moins une image ! 📸");
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('date', formData.date);
    data.append('location', formData.location);
    data.append('type', formData.type);
    if (!editing && forParish && user && user.parish) data.append('parishId', user.parish);
    
    // Ajouter chaque fichier
    files.forEach(file => {
        data.append('images', file);
    });

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(editing ? `${API_URL}/events/${id}` : `${API_URL}/events`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` }, // Pas de Content-Type manuel avec FormData
        body: data
      });

      if (res.ok) {
        toast.success(editing ? 'Événement modifié ! Il sera revalidé par l’administration si nécessaire.' : 'Événement envoyé ! 🎉 Il sera visible après validation par l’administration.', { autoClose: 6000 });
        navigate('/events');
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Erreur lors de la création");
      }
    } catch (err) {
      toast.error("Erreur serveur");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <div className="card" style={{ padding:'30px' }}>
        <h2 style={{ textAlign:'center', marginBottom:'20px', color:'var(--primary)' }}>{editing ? 'Modifier l’événement' : 'Créer un Événement'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!editing && user && user.parish && (
            <label style={{ display:'flex', gap:10, alignItems:'center', marginBottom:15 }}>
              <input type="checkbox" checked={forParish} onChange={e => setForParish(e.target.checked)} style={{ width:'auto', margin:0 }} />
              Publier pour ma paroisse
            </label>
          )}
          
          {/* Upload Zone */}
          <div style={{ marginBottom:'20px', textAlign:'center', border:'2px dashed #ccc', padding:'20px', borderRadius:'10px', background:'#f9f9f9' }}>
            <label htmlFor="fileInput" style={{ cursor:'pointer', display:'block' }}>
                <FaCamera style={{ fontSize:'2em', color:'var(--primary)', marginBottom:'10px' }} />
                <div style={{ fontWeight:'bold', color:'#555' }}>{editing ? 'Remplacer les photos (facultatif)' : 'Ajouter des photos (Min. 1)'}</div>
                <small style={{ color:'#888' }}>Cliquez pour sélectionner</small>
            </label>
            <input 
                id="fileInput" 
                type="file" 
                multiple // IMPORTANT : Autorise plusieurs fichiers
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display:'none' }} 
            />
            
            {editing && existingImages.length > 0 && previews.length === 0 && (
                <div style={{ display:'flex', gap:'10px', marginTop:'15px', overflowX:'auto' }}>
                    {existingImages.map((src, idx) => (<img key={idx} src={src} alt="Actuelle" style={{ width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px', border:'1px solid #ddd' }} />))}
                </div>
            )}
            {/* Prévisualisation */}
            {previews.length > 0 && (
                <div style={{ display:'flex', gap:'10px', marginTop:'15px', overflowX:'auto', paddingBottom:'5px' }}>
                    {previews.map((src, idx) => (
                        <img key={idx} src={src} alt="Aperçu" style={{ width:'80px', height:'80px', objectFit:'cover', borderRadius:'8px', border:'1px solid #ddd' }} />
                    ))}
                </div>
            )}
          </div>

          <label><FaAlignLeft /> Titre</label>
          <input name="title" value={formData.title} placeholder="Ex: Grand Concert de Louange" onChange={handleChange} required />
          
          <label><FaAlignLeft /> Description</label>
          <textarea name="description" value={formData.description} placeholder="Détails de l'événement..." onChange={handleChange} required style={{ minHeight:'100px' }} />
          
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px' }}>
            <div>
                <label><FaCalendarPlus /> Date & Heure</label>
                <input name="date" type="datetime-local" value={formData.date} onChange={handleChange} required />
            </div>
            <div>
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                    <option>Culte</option>
                    <option>Réunion</option>
                    <option>Concert</option>
                    <option>Fête</option>
                    <option>Séminaire</option>
                    <option>Autre</option>
                </select>
            </div>
          </div>

          <label><FaMapMarkerAlt /> Lieu</label>
          <input name="location" value={formData.location} placeholder="Ex: Grande Salle ou Adresse" onChange={handleChange} required />

          <button type="submit" style={{ marginTop:'20px', width:'100%', padding:'15px', fontSize:'1.1em' }}>
            {editing ? 'Enregistrer les modifications' : "Publier l'événement"}
          </button>
        </form>
      </div>
    </div>
  );
}