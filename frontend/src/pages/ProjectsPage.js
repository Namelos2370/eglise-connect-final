import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaHandHoldingHeart, FaPlus, FaTrash, FaChartLine } from 'react-icons/fa';
import API_URL from '../config';

export default function ProjectsPage() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Formulaire
  const [formData, setFormData] = useState({ title:'', description:'', targetAmount:'', category:'Autre' });
  const [file, setFile] = useState(null);
  
  // État pour le don
  const [donationAmount, setDonationAmount] = useState({}); // { projectId: amount }

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
        const res = await fetch(`${API_URL}/projects`);
        if(res.ok) setProjects(await res.json());
    } catch(e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('targetAmount', formData.targetAmount);
    data.append('category', formData.category);
    if (file) data.append('image', file);

    try {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data
        });
        if(res.ok) {
            toast.success("Projet lancé ! 🚀");
            setShowForm(false); setFormData({ title:'', description:'', targetAmount:'', category:'Autre' }); setFile(null);
            fetchProjects();
        }
    } catch(e) { toast.error("Erreur"); }
  };

  const handleSupport = async (projectId) => {
      if(!user) return toast.info("Connectez-vous pour soutenir.");
      const amount = donationAmount[projectId];
      if(!amount || amount <= 0) return toast.warning("Montant invalide");

      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/projects/${projectId}/support`, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ amount })
          });
          if(res.ok) {
              toast.success(`Merci pour votre don de ${amount} !`);
              setDonationAmount({...donationAmount, [projectId]: ''});
              fetchProjects();
          }
      } catch(e) { toast.error("Erreur"); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Supprimer ce projet ?")) return;
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setProjects(projects.filter(p => p._id !== id));
  };

  // Calcul pourcentage
  const getProgress = (current, target) => {
      const percent = Math.round((current / target) * 100);
      return percent > 100 ? 100 : percent;
  };

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto', padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' }}>
            <div>
                <h2 style={{ margin:0, color:'var(--secondary)', display:'flex', alignItems:'center', gap:10 }}>
                    <FaChartLine style={{color:'var(--primary)'}}/> Projets Solidaires
                </h2>
                <p style={{ margin:0, color:'#888', fontSize:'0.9em' }}>Financez les rêves de la communauté</p>
            </div>
            {user && <button onClick={() => setShowForm(!showForm)} style={{ borderRadius:'25px', display:'flex', alignItems:'center', gap:5 }}><FaPlus /> Lancer un projet</button>}
        </div>

        {showForm && (
            <div className="card" style={{ padding:'25px', borderTop:'4px solid var(--primary)', marginBottom:'30px' }}>
                <h3>Mon Projet</h3>
                <form onSubmit={handleSubmit}>
                    <input placeholder="Titre du projet" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:15 }}>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Santé</option><option>Études</option><option>Commerce</option><option>Urgence</option><option>Église</option><option>Autre</option>
                        </select>
                        <input type="number" placeholder="Montant Cible (XAF)" value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: e.target.value})} required />
                    </div>
                    <textarea placeholder="Décrivez votre besoin..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                    <input type="file" onChange={e => setFile(e.target.files[0])} accept="image/*" style={{marginTop:10}} />
                    <button type="submit" style={{ marginTop:'15px', width:'100%' }}>Publier</button>
                </form>
            </div>
        )}

        <div style={{ display:'grid', gap:'25px' }}>
            {projects.map(project => {
                const percent = getProgress(project.currentAmount, project.targetAmount);
                return (
                    <div key={project._id} className="card" style={{ padding:0, overflow:'hidden' }}>
                        {project.image && <div style={{ height:'150px', background:`url(${project.image}) center/cover` }}></div>}
                        
                        <div style={{ padding:'20px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                                <div>
                                    <span style={{ fontSize:'0.75em', background:'#f3f4f6', padding:'3px 8px', borderRadius:'5px', color:'#555' }}>{project.category}</span>
                                    <h3 style={{ margin:'5px 0', fontSize:'1.3em' }}>{project.title}</h3>
                                    <small style={{color:'#888'}}>Par {project.author?.name}</small>
                                </div>
                                {user && user._id === project.author._id && (
                                    <button onClick={() => handleDelete(project._id)} style={{ background:'#fee2e2', color:'#dc2626', padding:'5px 10px', fontSize:'0.8em' }}><FaTrash /></button>
                                )}
                            </div>
                            
                            <p style={{ color:'#555', margin:'15px 0', lineHeight:1.5 }}>{project.description}</p>
                            
                            {/* BARRE PROGRESSION */}
                            <div style={{ margin:'20px 0' }}>
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:'0.9em', fontWeight:'bold' }}>
                                    <span style={{color:'var(--primary)'}}>{project.currentAmount.toLocaleString()} XAF</span>
                                    <span style={{color:'#888'}}>{percent}% de {project.targetAmount.toLocaleString()}</span>
                                </div>
                                <div style={{ width:'100%', height:'10px', background:'#eee', borderRadius:'5px', overflow:'hidden' }}>
                                    <div style={{ width:`${percent}%`, height:'100%', background:'linear-gradient(90deg, var(--primary), #f59e0b)', transition:'width 0.5s' }}></div>
                                </div>
                            </div>

                            {/* ZONE DON */}
                            <div style={{ display:'flex', gap:10, marginTop:'10px' }}>
                                <input 
                                    type="number" placeholder="Montant..." 
                                    value={donationAmount[project._id] || ''} 
                                    onChange={e => setDonationAmount({...donationAmount, [project._id]: e.target.value})}
                                    style={{ margin:0, width:'120px' }}
                                />
                                <button onClick={() => handleSupport(project._id)} style={{ display:'flex', alignItems:'center', gap:5, padding:'10px 20px' }}>
                                    <FaHandHoldingHeart /> Soutenir
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
}