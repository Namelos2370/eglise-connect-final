import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTrash, FaNewspaper, FaCalendarAlt, FaExclamationTriangle, FaCommentDots, FaSync } from 'react-icons/fa';

export default function ContentManager() {
  const [data, setData] = useState({ posts: [], events: [], comments: [] });
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3002/admin/content', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setData(await res.json());
        } else {
            toast.error("Erreur chargement (Êtes-vous Admin ?)");
        }
    } catch (err) { console.error(err); toast.error("Erreur connexion serveur"); }
    setLoading(false);
  };

  const handleDelete = async (type, id, secondId = null) => {
    if(!window.confirm("Supprimer définitivement cet élément ?")) return;
    const token = localStorage.getItem('token');
    
    let url = `http://localhost:3002/admin/${type}/${id}`;
    // Cas spécial pour les commentaires : besoin de l'ID du post ET du commentaire
    if (type === 'comments') {
        url = `http://localhost:3002/admin/comments/${secondId}/${id}`; // postID / commentID
    }

    try {
        const res = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { toast.success("Supprimé avec succès"); fetchContent(); }
        else { toast.error("Erreur suppression"); }
    } catch(err) { toast.error("Erreur serveur"); }
  };

  return (
    <div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid var(--primary)', paddingBottom:10, marginBottom:20 }}>
            <h2 style={{ margin:0, color:'var(--secondary)' }}>Modération</h2>
            <button onClick={fetchContent} style={{ background:'transparent', color:'var(--primary)', border:'1px solid var(--primary)', padding:'5px 15px', display:'flex', alignItems:'center', gap:5 }}>
                <FaSync className={loading ? "fa-spin" : ""} /> Actualiser
            </button>
        </div>
        
        <div style={{ display:'flex', gap:10, marginBottom:'20px', flexWrap:'wrap' }}>
            <button onClick={() => setActiveTab('posts')} style={{ background: activeTab==='posts'?'var(--primary)':'white', color: activeTab==='posts'?'white':'#666', border: activeTab==='posts'?'none':'1px solid #eee', boxShadow: activeTab==='posts'?'0 4px 10px rgba(0,0,0,0.1)':'none', display:'flex', alignItems:'center', gap:8 }}>
                <FaNewspaper /> Publications ({data.posts.length})
            </button>
            <button onClick={() => setActiveTab('events')} style={{ background: activeTab==='events'?'var(--primary)':'white', color: activeTab==='events'?'white':'#666', border: activeTab==='events'?'none':'1px solid #eee', boxShadow: activeTab==='events'?'0 4px 10px rgba(0,0,0,0.1)':'none', display:'flex', alignItems:'center', gap:8 }}>
                <FaCalendarAlt /> Événements ({data.events.length})
            </button>
            <button onClick={() => setActiveTab('comments')} style={{ background: activeTab==='comments'?'var(--primary)':'white', color: activeTab==='comments'?'white':'#666', border: activeTab==='comments'?'none':'1px solid #eee', boxShadow: activeTab==='comments'?'0 4px 10px rgba(0,0,0,0.1)':'none', display:'flex', alignItems:'center', gap:8 }}>
                <FaCommentDots /> Commentaires ({data.comments.length})
            </button>
        </div>

        <div className="card" style={{ padding:0, overflow:'hidden', border:'none', boxShadow:'0 5px 20px rgba(0,0,0,0.05)' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                    <tr style={{ background:'#f9fafb', textAlign:'left', color:'#888', fontSize:'0.9em', textTransform:'uppercase' }}>
                        <th style={{ padding:20 }}>Auteur</th>
                        <th style={{ padding:20 }}>Contenu</th>
                        <th style={{ padding:20 }}>Date</th>
                        <th style={{ padding:20 }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {/* --- LISTE DES POSTS --- */}
                    {activeTab === 'posts' && data.posts.map(post => (
                        <tr key={post._id} style={{ borderBottom:'1px solid #f0f0f0' }}>
                            <td style={{ padding:20, fontWeight:'bold', color:'#333' }}>{post.author?.name || 'Inconnu'}</td>
                            <td style={{ padding:20, color:'#555' }}>
                                {post.content ? post.content.substring(0, 60) : <i>Sans texte</i>}
                                {post.content?.length > 60 && '...'}
                                {post.image && <span style={{ marginLeft:10, fontSize:'0.75em', background:'#eef2ff', color:'#4f46e5', padding:'2px 6px', borderRadius:4 }}>📷 Image</span>}
                            </td>
                            <td style={{ padding:20, fontSize:'0.9em', color:'#999' }}>{new Date(post.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding:20 }}>
                                <button onClick={() => handleDelete('posts', post._id)} style={{ background:'#fee2e2', color:'#dc2626', padding:'8px 12px', fontSize:'0.8em', display:'flex', alignItems:'center', gap:5 }}><FaTrash /> Supprimer</button>
                            </td>
                        </tr>
                    ))}

                    {/* --- LISTE DES ÉVÉNEMENTS --- */}
                    {activeTab === 'events' && data.events.map(event => (
                        <tr key={event._id} style={{ borderBottom:'1px solid #f0f0f0' }}>
                            <td style={{ padding:20, fontWeight:'bold', color:'#333' }}>{event.organizer?.name || 'Inconnu'}</td>
                            <td style={{ padding:20, color:'#555' }}>
                                <strong>{event.title}</strong><br/>
                                <span style={{fontSize:'0.9em'}}>{event.type} à {event.location}</span>
                            </td>
                            <td style={{ padding:20, fontSize:'0.9em', color:'#999' }}>{new Date(event.date).toLocaleDateString()}</td>
                            <td style={{ padding:20 }}>
                                <button onClick={() => handleDelete('events', event._id)} style={{ background:'#fee2e2', color:'#dc2626', padding:'8px 12px', fontSize:'0.8em', display:'flex', alignItems:'center', gap:5 }}><FaTrash /> Supprimer</button>
                            </td>
                        </tr>
                    ))}

                    {/* --- LISTE DES COMMENTAIRES (NOUVEAU) --- */}
                    {activeTab === 'comments' && data.comments.map(com => (
                        <tr key={com._id} style={{ borderBottom:'1px solid #f0f0f0' }}>
                            <td style={{ padding:20, color:'#666' }}>
                                {/* L'auteur n'est pas toujours peuplé ici, on met un placeholder */}
                                <span style={{fontStyle:'italic'}}>Membre</span>
                            </td>
                            <td style={{ padding:20, color:'#555' }}>
                                "{com.text}" <br/>
                                <span style={{fontSize:'0.8em', color:'#aaa'}}>Sur le post : {com.postTitle}</span>
                            </td>
                            <td style={{ padding:20, fontSize:'0.9em', color:'#999' }}>{new Date(com.date).toLocaleDateString()}</td>
                            <td style={{ padding:20 }}>
                                <button onClick={() => handleDelete('comments', com._id, com.postId)} style={{ background:'#fee2e2', color:'#dc2626', padding:'8px 12px', fontSize:'0.8em', display:'flex', alignItems:'center', gap:5 }}><FaTrash /> Supprimer</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Message si vide */}
            {((activeTab === 'posts' && data.posts.length === 0) || 
              (activeTab === 'events' && data.events.length === 0) ||
              (activeTab === 'comments' && data.comments.length === 0)) && (
                <div style={{ textAlign:'center', padding:'40px', color:'#999' }}>
                    <FaExclamationTriangle style={{ marginBottom:10, fontSize:'2em', opacity:0.3 }} />
                    <p>Aucun élément trouvé.</p>
                </div>
            )}
        </div>
    </div>
  );
}