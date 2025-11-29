import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUsers, FaPlus, FaArrowRight, FaSearch, FaExclamationCircle, FaLock, FaGlobe } from 'react-icons/fa';
import API_URL from '../config';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchGroups(); }, []);

  const fetchGroups = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/groups`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setGroups(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setUploading(true);
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', desc);
    if (file) formData.append('photo', file);
    try {
        const res = await fetch(`${API_URL}/groups`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
        if (res.ok) { toast.success("Groupe créé !"); setShowForm(false); setName(''); setDesc(''); setFile(null); fetchGroups(); } 
        else { toast.error("Erreur création"); }
    } catch (err) { toast.error("Erreur serveur"); }
    setUploading(false);
  };

  const filteredGroups = groups.filter(g => {
      const groupName = g.name ? g.name.toLowerCase() : "";
      const groupDesc = g.description ? g.description.toLowerCase() : "";
      const search = searchTerm.toLowerCase();
      return groupName.includes(search) || groupDesc.includes(search);
  });

  return (
    <div style={{ maxWidth:'900px', margin:'0 auto', padding:'20px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px', background:'white', padding:'30px', borderRadius:'20px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ color:'var(--secondary)', fontSize:'2rem', margin:0 }}><FaUsers style={{color:'var(--primary)'}}/> Ministères</h2>
            <p style={{ color:'#888', margin:'10px 0 20px 0' }}>Rejoignez un groupe pour grandir ensemble.</p>
            <div style={{ position: 'relative', maxWidth:'500px', margin:'0 auto' }}>
                <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform:'translateY(-50%)', color: 'var(--primary)' }} />
                <input type="text" placeholder="Trouver un groupe..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width:'100%', padding:'15px 15px 15px 50px', borderRadius:'50px', border:'1px solid #eee', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', fontSize:'1rem', outline:'none' }} />
            </div>
            <button onClick={() => setShowForm(!showForm)} style={{ marginTop:'20px', borderRadius:'25px', display:'inline-flex', alignItems:'center', gap:5 }}><FaPlus /> Créer un groupe</button>
        </div>

        {showForm && (
            <div className="card" style={{ padding:'30px', marginBottom:'30px', borderTop:'4px solid var(--primary)', animation:'fadeIn 0.3s' }}>
                <h3>Nouveau Ministère</h3>
                <form onSubmit={handleCreate}>
                    <input placeholder="Nom (ex: Chorale)" value={name} onChange={e => setName(e.target.value)} required />
                    <textarea placeholder="Mission du groupe..." value={desc} onChange={e => setDesc(e.target.value)} required style={{ minHeight:100 }} />
                    <label style={{display:'block', margin:'15px 0', fontWeight:'bold', color:'#555'}}>Image de couverture :</label>
                    <input type="file" onChange={e => setFile(e.target.files[0])} />
                    <button type="submit" disabled={uploading} style={{ marginTop:'20px', width:'100%' }}>{uploading ? "Création..." : "Lancer le groupe"}</button>
                </form>
            </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'25px' }}>
            {filteredGroups.map(group => (
                <Link key={group._id} to={`/groups/${group._id}`} style={{ textDecoration:'none', color:'inherit' }}>
                    <div className="card" style={{ padding:0, overflow:'hidden', height:'100%', display:'flex', flexDirection:'column', transition:'transform 0.2s', border:'none', boxShadow:'0 5px 15px rgba(0,0,0,0.05)' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-5px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                        <div style={{ height:'120px', background: group.photo ? `url(${group.photo}) center/cover` : 'linear-gradient(135deg, var(--primary), #c6921e)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                            {!group.photo && <FaUsers style={{ fontSize:'3em', color:'white', opacity:0.5 }} />}
                            <div style={{ position:'absolute', bottom:-20, right:20, background:'white', padding:'10px', borderRadius:'50%', boxShadow:'0 5px 15px rgba(0,0,0,0.1)' }}>
                                {group.isPrivate ? <FaLock color="#dc2626"/> : <FaGlobe color="#10b981"/>}
                            </div>
                        </div>
                        <div style={{ padding:'25px 20px 20px 20px', flex:1, display:'flex', flexDirection:'column' }}>
                            <h3 style={{ margin:'0 0 5px 0', fontSize:'1.3em', color:'#333' }}>{group.name}</h3>
                            <p style={{ fontSize:'0.95em', color:'#666', flex:1, lineHeight:1.5 }}>{group.description}</p>
                            
                            {/* CORRECTION ICI : Sécurisation de .length */}
                            <div style={{ marginTop:'20px', borderTop:'1px solid #f5f5f5', paddingTop:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', color:'var(--primary)', fontWeight:'bold', fontSize:'0.9em' }}>
                                <span>{(group.members || []).length} membres</span>
                                <span style={{ background:'#fdfbf7', padding:'5px 10px', borderRadius:'15px' }}>Rejoindre <FaArrowRight style={{marginLeft:5}}/></span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
        
        {filteredGroups.length === 0 && <p style={{textAlign:'center', color:'#999', padding:30}}>Aucun groupe trouvé.</p>}
    </div>
  );
}