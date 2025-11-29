import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaTools, FaGraduationCap, FaShoppingBag, FaHandsHelping, 
  FaLaptop, FaPlus, FaTag, FaMapMarkerAlt, FaPhone, 
  FaTrash, FaUser, FaStore, FaSearch, FaCommentDots 
} from 'react-icons/fa';
import API_URL from '../config';

export default function MarketplacePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [services, setServices] = useState([]);
  const [filter, setFilter] = useState('Tout');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title:'', description:'', category:'Divers', price:'', phone:'' });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
        const res = await fetch(`${API_URL}/services`);
        if(res.ok) setServices(await res.json());
    } catch(e) { console.error(e); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/services`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(formData)
        });
        if(res.ok) {
            toast.success("Annonce publiée ! 💼");
            setShowForm(false); setFormData({ title:'', description:'', category:'Divers', price:'', phone:'' });
            fetchServices();
        }
    } catch(e) { toast.error("Erreur"); }
  };

  const handleDelete = async (id) => {
      if(!window.confirm("Retirer cette annonce ?")) return;
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/services/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setServices(services.filter(s => s._id !== id));
  };

  const getIcon = (cat) => {
      if(cat.includes('Bricolage')) return <FaTools />;
      if(cat.includes('Cours')) return <FaGraduationCap />;
      if(cat.includes('Vente')) return <FaShoppingBag />;
      if(cat.includes('Aide')) return <FaHandsHelping />;
      if(cat.includes('Tech')) return <FaLaptop />;
      return <FaTag />;
  };

  const filtered = services.filter(s => {
      const matchesCategory = filter === 'Tout' || s.category === filter;
      const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'20px' }}>
        
        {/* HEADER PREMIUM */}
        <div style={{ textAlign:'center', marginBottom:'40px', background:'linear-gradient(135deg, #fff 0%, #f9f9f9 100%)', padding:'40px', borderRadius:'20px', boxShadow:'0 10px 30px rgba(0,0,0,0.03)' }}>
            <FaStore style={{ fontSize:'3rem', color:'var(--primary)', marginBottom:10 }} />
            <h1 style={{ margin:0, color:'var(--secondary)', fontSize:'2rem' }}>Le Marché des Talents</h1>
            <p style={{ color:'#888', fontSize:'1.1rem' }}>Découvrez les services et produits de la communauté.</p>
            
            {/* RECHERCHE */}
            <div style={{ position: 'relative', maxWidth:'500px', margin:'20px auto 0' }}>
                <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform:'translateY(-50%)', color: 'var(--primary)' }} />
                <input type="text" placeholder="Que cherchez-vous ?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    style={{ width:'100%', padding:'15px 15px 15px 50px', borderRadius:'50px', border:'1px solid #eee', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', fontSize:'1rem', outline:'none' }} 
                />
            </div>
            
            {user && (
                <button onClick={() => setShowForm(!showForm)} style={{ marginTop:'20px', borderRadius:'30px', padding:'10px 25px', display:'inline-flex', alignItems:'center', gap:8 }}>
                    <FaPlus /> Publier une annonce
                </button>
            )}
        </div>

        {showForm && (
            <div className="card" style={{ padding:'30px', borderTop:'4px solid var(--primary)', marginBottom:'30px', animation:'fadeIn 0.3s' }}>
                <h3 style={{marginTop:0}}>Nouvelle Offre</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:15 }}>
                        <input placeholder="Titre (ex: Cours de Maths...)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        <input placeholder="Prix (ex: 5000 FCFA)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    </div>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{marginBottom:15}}>
                        <option>Bricolage</option><option>Cours & Soutien</option><option>Vente Produits</option><option>Aide à la personne</option><option>Tech & Pro</option><option>Autre</option>
                    </select>
                    <textarea placeholder="Description détaillée..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required style={{minHeight:'100px'}} />
                    <input placeholder="Tél contact (Optionnel)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    <button type="submit" style={{ marginTop:'10px', width:'100%' }}>Valider l'annonce</button>
                </form>
            </div>
        )}

        {/* FILTRES PILLULES */}
        <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:15, marginBottom:20, justifyContent:'center' }}>
            {['Tout', 'Bricolage', 'Cours & Soutien', 'Vente Produits', 'Aide à la personne', 'Tech & Pro'].map(cat => (
                <button key={cat} onClick={() => setFilter(cat)} style={{ 
                    background: filter===cat ? 'var(--primary)' : 'white', color: filter===cat ? 'white' : '#666', 
                    border:'1px solid #eee', borderRadius:'20px', padding:'8px 20px', fontSize:'0.9em', whiteSpace:'nowrap', boxShadow: filter===cat ? '0 4px 10px rgba(223,169,46,0.3)' : 'none'
                }}>
                    {cat}
                </button>
            ))}
        </div>

        {/* GRILLE PREMIUM */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'25px' }}>
            {filtered.map(service => (
                <div key={service._id} className="card" style={{ padding:0, overflow:'hidden', border:'none', display:'flex', flexDirection:'column', transition:'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    
                    {/* BANDEAU CATÉGORIE */}
                    <div style={{ background: service.category.includes('Vente') ? '#10b981' : 'var(--secondary)', padding:'10px 20px', color:'white', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <span style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.9em', fontWeight:'bold' }}>{getIcon(service.category)} {service.category}</span>
                        <span style={{ background:'rgba(255,255,255,0.2)', padding:'2px 8px', borderRadius:'10px', fontSize:'0.8em' }}>{new Date(service.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div style={{ padding:'25px', flex:1, display:'flex', flexDirection:'column' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:10 }}>
                            <h3 style={{ margin:0, fontSize:'1.3rem', color:'#333', lineHeight:1.3 }}>{service.title}</h3>
                            {user && user._id === service.author._id && <button onClick={() => handleDelete(service._id)} style={{ background:'transparent', color:'#dc2626', padding:0, boxShadow:'none' }}><FaTrash /></button>}
                        </div>
                        
                        <div style={{ fontSize:'1.2rem', fontWeight:'bold', color:'var(--primary)', marginBottom:15 }}>{service.price}</div>
                        <p style={{ color:'#666', margin:0, lineHeight:1.6, flex:1 }}>{service.description}</p>
                    </div>
                    
                    {/* FOOTER CARTE */}
                    <div style={{ padding:'15px 20px', background:'#fafafa', borderTop:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <img src={service.author.photo || "https://via.placeholder.com/40"} style={{width:35, height:35, borderRadius:'50%', objectFit:'cover', border:'2px solid white', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}} alt="aut"/>
                            <div style={{fontSize:'0.85em'}}>
                                <div style={{fontWeight:'bold'}}>{service.author.name}</div>
                                <div style={{color:'#888'}}>{service.author.city || 'Local'}</div>
                            </div>
                        </div>
                        
                        {user && user._id !== service.author._id ? (
                            <Link to={`/user/${service.author._id}`} style={{ textDecoration:'none' }}>
                                <button style={{ padding:'8px 15px', borderRadius:'20px', fontSize:'0.8em', background:'white', color:'var(--primary)', border:'1px solid var(--primary)' }}>
                                    Contacter
                                </button>
                            </Link>
                        ) : (
                            service.phone && <a href={`tel:${service.phone}`} style={{ textDecoration:'none', color:'var(--primary)', fontWeight:'bold', display:'flex', alignItems:'center', gap:5 }}><FaPhone /> {service.phone}</a>
                        )}
                    </div>
                </div>
            ))}
        </div>
        {filtered.length === 0 && <p style={{textAlign:'center', color:'#999', padding:30}}>Aucune annonce trouvée.</p>}
    </div>
  );
}