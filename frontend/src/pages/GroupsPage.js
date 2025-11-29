import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUsers, FaPlus, FaArrowRight, FaSearch } from 'react-icons/fa';
import API_URL from '../config'; // Utilisation de la config V2.1

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState(null);

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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', desc);
    if (file) formData.append('photo', file);

    try {
        const res = await fetch(`${API_URL}/groups`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
        });
        if (res.ok) {
            toast.success("Groupe créé !");
            setShowForm(false); setName(''); setDesc(''); setFile(null);
            fetchGroups();
        }
    } catch (err) { toast.error("Erreur création"); }
  };

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto', padding:'20px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' }}>
            <h2 style={{ margin:0, display:'flex', alignItems:'center', gap:10, color:'var(--secondary)' }}>
                <FaUsers style={{color:'var(--primary)'}}/> Ministères & Groupes
            </h2>
            <button onClick={() => setShowForm(!showForm)} style={{ borderRadius:'20px', display:'flex', alignItems:'center', gap:5 }}>
                <FaPlus /> Créer
            </button>
        </div>

        {showForm && (
            <div className="card" style={{ padding:'20px', marginBottom:'30px', borderTop:'3px solid var(--primary)' }}>
                <h3>Nouveau Groupe</h3>
                <form onSubmit={handleCreate}>
                    <input placeholder="Nom du groupe (ex: Chorale)" value={name} onChange={e => setName(e.target.value)} required />
                    <textarea placeholder="Description..." value={desc} onChange={e => setDesc(e.target.value)} required />
                    <label style={{display:'block', margin:'10px 0', fontSize:'0.9em', fontWeight:'bold', color:'#666'}}>Logo / Photo :</label>
                    <input type="file" onChange={e => setFile(e.target.files[0])} />
                    <button type="submit" style={{ marginTop:'15px', width:'100%' }}>Créer le groupe</button>
                </form>
            </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'20px' }}>
            {groups.map(group => (
                <Link key={group._id} to={`/groups/${group._id}`} style={{ textDecoration:'none', color:'inherit' }}>
                    <div className="card" style={{ padding:0, overflow:'hidden', height:'100%', display:'flex', flexDirection:'column', transition:'transform 0.2s' }}>
                        <div style={{ height:'140px', background: group.photo ? `url(${group.photo}) center/cover` : 'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {!group.photo && <FaUsers style={{ fontSize:'3em', color:'white', opacity:0.5 }} />}
                        </div>
                        <div style={{ padding:'15px', flex:1, display:'flex', flexDirection:'column' }}>
                            <h3 style={{ margin:'0 0 5px 0', fontSize:'1.2em' }}>{group.name}</h3>
                            <p style={{ fontSize:'0.9em', color:'#666', flex:1 }}>{group.description}</p>
                            <div style={{ marginTop:'15px', display:'flex', justifyContent:'space-between', alignItems:'center', color:'var(--primary)', fontWeight:'bold', fontSize:'0.9em' }}>
                                <span>{group.members.length} membres</span>
                                <FaArrowRight />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
  );
}