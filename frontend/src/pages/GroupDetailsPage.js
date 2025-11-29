import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaUsers, FaPen, FaCamera, FaRegListAlt } from 'react-icons/fa';
import API_URL from '../config';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [file, setFile] = useState(null);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' ou 'members'

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    const token = localStorage.getItem('token');
    try {
        const resGroup = await fetch(`${API_URL}/groups/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resGroup.ok) setGroup(await resGroup.json());

        const resPosts = await fetch(`${API_URL}/posts/group/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resPosts.ok) setPosts(await resPosts.json());
    } catch (err) { console.error(err); }
  };

  const handleJoin = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/groups/${id}/join`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) fetchGroupData();
    } catch (err) { toast.error("Erreur"); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !file) return;
    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('groupId', id);
    if (file) formData.append('image', file);

    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/posts`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
        });
        if (res.ok) {
            toast.success("Publié dans le groupe !");
            setNewPost(''); setFile(null); fetchGroupData();
        }
    } catch (err) { toast.error("Erreur"); }
  };

  if (!group) return <p style={{textAlign:'center', marginTop:'50px'}}>Chargement...</p>;

  const isMember = group.members.some(m => m._id === user._id);

  return (
    <div style={{ maxWidth:'800px', margin:'0 auto', padding:'20px' }}>
        <Link to="/groups" style={{ textDecoration:'none', color:'#666', display:'flex', alignItems:'center', gap:5, marginBottom:'20px' }}><FaArrowLeft /> Retour</Link>

        {/* BANNIÈRE GROUPE */}
        <div className="card" style={{ padding:'30px', textAlign:'center', borderTop:'5px solid var(--primary)' }}>
            {group.photo ? (
                <img src={group.photo} alt={group.name} style={{ width:100, height:100, borderRadius:'50%', objectFit:'cover', border:'4px solid #eee', margin:'0 auto 15px auto' }} />
            ) : (
                <div style={{ width:100, height:100, borderRadius:'50%', background:'var(--primary)', margin:'0 auto 15px auto', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'2.5em' }}><FaUsers /></div>
            )}
            <h1 style={{ margin:0 }}>{group.name}</h1>
            <p style={{ color:'#666' }}>{group.description}</p>
            <div style={{ marginTop:'20px' }}>
                <button onClick={handleJoin} style={{ background: isMember ? '#eee' : 'var(--primary)', color: isMember ? '#333' : 'white' }}>
                    {isMember ? "Quitter le groupe" : "Rejoindre le groupe"}
                </button>
            </div>
        </div>

        {/* ONGLETS */}
        {isMember && (
            <>
                <div style={{ display:'flex', marginTop:'30px', marginBottom:'20px', gap:10 }}>
                    <button onClick={() => setActiveTab('feed')} style={{ flex:1, background: activeTab==='feed'?'var(--primary)':'white', color: activeTab==='feed'?'white':'#666', border: '1px solid #eee' }}>Fil d'Actu</button>
                    <button onClick={() => setActiveTab('members')} style={{ flex:1, background: activeTab==='members'?'var(--primary)':'white', color: activeTab==='members'?'white':'#666', border: '1px solid #eee' }}>Membres ({group.members.length})</button>
                </div>

                {/* FIL D'ACTU DU GROUPE */}
                {activeTab === 'feed' && (
                    <>
                        <div className="card" style={{ padding:'20px', marginBottom:'20px' }}>
                            <textarea placeholder={`Écrire au groupe ${group.name}...`} value={newPost} onChange={e => setNewPost(e.target.value)} style={{ width:'100%', minHeight:'60px', border:'1px solid #eee', padding:'10px', borderRadius:'10px' }} />
                            <div style={{ display:'flex', justifyContent:'space-between', marginTop:'10px' }}>
                                <label style={{cursor:'pointer', display:'flex', alignItems:'center', gap:5, color:'var(--primary)'}}><FaCamera /><input type="file" onChange={e => setFile(e.target.files[0])} style={{ display:'none' }} /> Photo</label>
                                <button onClick={handlePost} style={{ padding:'5px 15px', fontSize:'0.9em' }}>Publier</button>
                            </div>
                        </div>

                        {posts.length === 0 ? <p style={{textAlign:'center', color:'#999'}}>Aucune publication.</p> : (
                            <div style={{ display:'grid', gap:'20px' }}>
                                {posts.map(post => (
                                    <div key={post._id} className="card" style={{ padding:'20px' }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'10px' }}>
                                            <img src={post.author?.photo || "https://via.placeholder.com/40"} style={{width:40, height:40, borderRadius:'50%', objectFit:'cover'}} alt="av"/>
                                            <div><strong style={{display:'block'}}>{post.author?.name}</strong><small style={{color:'#999'}}>{new Date(post.createdAt).toLocaleDateString()}</small></div>
                                        </div>
                                        <p>{post.content}</p>
                                        {post.image && <img src={post.image} alt="post" style={{width:'100%', borderRadius:'10px', marginTop:'10px'}} />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* LISTE DES MEMBRES */}
                {activeTab === 'members' && (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:'15px' }}>
                        {group.members.map(member => (
                            <Link key={member._id} to={`/user/${member._id}`} style={{ textDecoration:'none', color:'inherit' }}>
                                <div className="card" style={{ padding:'15px', textAlign:'center' }}>
                                    <img src={member.photo || "https://via.placeholder.com/60"} style={{width:60, height:60, borderRadius:'50%', objectFit:'cover', marginBottom:'5px'}} alt="m"/>
                                    <div style={{ fontWeight:'bold', fontSize:'0.9em' }}>{member.name}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </>
        )}
    </div>
  );
}