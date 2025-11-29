import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { FaCamera, FaPaperPlane, FaPen, FaTrash, FaHeart, FaRegHeart, FaComment, FaShare, FaSave, FaSearch, FaLock, FaFlag, FaTimes } from 'react-icons/fa';
import ImageModal from '../components/ImageModal';
import Spinner from '../components/Spinner';
import API_URL from '../config'; 

export default function FeedPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // États Création
  const [newPost, setNewPost] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // Pour voir l'image avant envoi

  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [commentText, setCommentText] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setPosts(data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Gestion Image (Prévisualisation)
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile)); // Créer une URL temporaire
    }
  };

  const clearFile = () => {
      setFile(null);
      setPreviewUrl(null);
      document.getElementById('fileInput').value = "";
  };

  const filteredPosts = posts.filter(post => {
    const content = post.content ? post.content.toLowerCase() : "";
    const authorName = post.author?.name ? post.author.name.toLowerCase() : "";
    const search = searchTerm.toLowerCase();
    return content.includes(search) || authorName.includes(search);
  });

  const checkAuth = () => { if (!user) { toast.info("Connectez-vous !"); navigate('/login'); return false; } return true; };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    if (!newPost.trim() && !file) return toast.warning("Post vide !");
    
    const formData = new FormData(); 
    formData.append('content', newPost); 
    if (file) formData.append('image', file);
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/posts`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (res.ok) { 
          toast.success('Publié !'); 
          setNewPost(''); 
          clearFile(); // Nettoyer l'image
          fetchPosts(); 
      }
    } catch (err) { toast.error("Erreur"); }
  };

  // ... (Les autres fonctions saveEdit, handleDelete, handleLike... restent IDENTIQUES)
  const saveEdit = async (postId) => { const token = localStorage.getItem('token'); try { const res = await fetch(`${API_URL}/posts/${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content: editContent }) }); if (res.ok) { toast.success("Modifié !"); setEditingPostId(null); fetchPosts(); } } catch (err) { toast.error("Erreur"); } };
  const handleDelete = async (postId) => { if(!window.confirm("Supprimer ?")) return; const token = localStorage.getItem('token'); await fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchPosts(); toast.info("Supprimé"); };
  const handleLike = async (postId) => { if (checkAuth()) { const token = localStorage.getItem('token'); await fetch(`${API_URL}/posts/${postId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); fetchPosts(); }};
  const handleComment = async (postId) => { if (checkAuth()) { const text = commentText[postId]; if (!text) return; const token = localStorage.getItem('token'); await fetch(`${API_URL}/posts/${postId}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ text }) }); setCommentText({ ...commentText, [postId]: '' }); fetchPosts(); }};
  const handleShare = (post) => { if (navigator.share) navigator.share({ title: `Post`, text: post.content, url: window.location.href }).catch(console.error); else { navigator.clipboard.writeText(`${post.author?.name}: "${post.content}"`); toast.info("Copié !"); }};

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom:'60px' }}>
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />

      {/* BARRE DE RECHERCHE */}
      <div style={{ marginBottom:'20px', position:'relative' }}>
        <FaSearch style={{ position:'absolute', left:'20px', top:'50%', transform:'translateY(-50%)', color:'#aaa' }} />
        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft:'50px', borderRadius:'30px', border:'none', width:'100%', height:'50px', fontSize:'1rem', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }} />
      </div>

      {/* --- ZONE DE CRÉATION AMÉLIORÉE --- */}
      {user ? (
        <div className="card" style={{ padding:'20px', marginBottom:'30px', border:'1px solid #eee', boxShadow:'0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', gap: '15px', alignItems:'flex-start' }}>
                <img src={user.photo || 'https://via.placeholder.com/50'} style={{width:50, height:50, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--primary)'}} alt="moi" />
                <div style={{ flex:1 }}>
                    <textarea 
                        placeholder={`Quoi de neuf, ${user.name.split(' ')[0]} ? Partagez un verset, une pensée...`} 
                        value={newPost} 
                        onChange={e => setNewPost(e.target.value)} 
                        style={{ width:'100%', minHeight: '80px', border:'none', outline:'none', fontSize:'1.1rem', resize:'none', background:'transparent' }} 
                    />
                    
                    {/* PRÉVISUALISATION IMAGE */}
                    {previewUrl && (
                        <div style={{ position:'relative', marginTop:'10px', display:'inline-block' }}>
                            <img src={previewUrl} alt="Prévisualisation" style={{ maxHeight:'200px', borderRadius:'10px', border:'1px solid #ddd' }} />
                            <button onClick={clearFile} style={{ position:'absolute', top:5, right:5, background:'rgba(0,0,0,0.6)', color:'white', borderRadius:'50%', width:25, height:25, display:'flex', alignItems:'center', justifyContent:'center', padding:0 }}><FaTimes size={12} /></button>
                        </div>
                    )}
                </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '15px', marginTop:'10px' }}>
                <div>
                    <label htmlFor="fileInput" style={{ cursor:'pointer', color: file ? 'green' : '#666', fontWeight:'600', display:'flex', alignItems:'center', gap:8, padding:'8px 15px', borderRadius:'20px', background:'#f9f9f9', transition:'0.2s' }}>
                        <FaCamera style={{color:'var(--primary)'}} /> {file ? "Photo ajoutée" : "Photo"}
                    </label>
                    <input id="fileInput" type="file" onChange={handleFileChange} style={{ display:'none' }} accept="image/*" />
                </div>
                <button onClick={handlePost} disabled={!newPost.trim() && !file} style={{ borderRadius:'25px', padding:'10px 30px', opacity: (!newPost.trim() && !file) ? 0.5 : 1 }}>
                    Publier
                </button>
            </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign:'center', background:'#fdfbf7', border:'1px dashed var(--primary)', marginBottom:'30px', padding:'30px' }}>
            <p style={{ color:'#555', fontSize:'1.1rem' }}><FaLock /> Connectez-vous pour partager avec la communauté.</p>
            <Link to="/login"><button style={{marginTop:'10px'}}>Se connecter</button></Link>
        </div>
      )}

      {/* LISTE DES POSTS (Code identique, juste pour l'affichage) */}
      {filteredPosts.map(post => {
        const isMyPost = user && post.author?._id === user._id;
        const isEditing = editingPostId === post._id;
        const isLiked = user && post.likes.includes(user._id);
        return (
          <div key={post._id} className="card" style={{ padding: 0, overflow: 'hidden', marginBottom:'20px' }}>
             <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <img src={post.author?.photo || 'https://via.placeholder.com/50'} style={{width:45, height:45, borderRadius:'50%', objectFit:'cover'}} alt="author" />
                <div><strong style={{ display:'block', fontSize:'1rem' }}>{post.author?.name}</strong><small style={{ color: '#999' }}>{new Date(post.createdAt).toLocaleDateString()}</small></div>
              </div>
              {isMyPost && !isEditing && (<div style={{ display:'flex', gap:'5px' }}><button onClick={() => { setEditingPostId(post._id); setEditContent(post.content); }} style={{ padding:'8px', background:'#f3f4f6', color:'#333' }}><FaPen /></button><button onClick={() => handleDelete(post._id)} style={{ padding:'8px', background:'#fee2e2', color:'#dc2626' }}><FaTrash /></button></div>)}
            </div>
            <div style={{ padding: '0 20px 15px 20px' }}>
              {isEditing ? (
                <div><textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={{ width:'100%', minHeight:'80px' }} /><div style={{ display:'flex', gap:'10px', marginTop:'10px' }}><button onClick={() => saveEdit(post._id)} style={{ background:'#10b981' }}>Sauvegarder</button><button onClick={() => setEditingPostId(null)} style={{ background:'#ccc', color:'#333' }}>Annuler</button></div></div>
              ) : (
                <><p style={{ whiteSpace: 'pre-wrap', fontSize: '1.1rem', lineHeight:'1.5', color:'#333' }}>{post.content}</p>{post.image && (<img src={post.image} alt="Post" style={{ width: '100%', borderRadius: '10px', marginTop:'15px', cursor:'zoom-in' }} onClick={() => setSelectedImage(post.image)} />)}</>
              )}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display:'flex', justifyContent:'space-between', background:'#fff', alignItems:'center' }}>
              <div style={{ display:'flex', gap:25 }}>
                <button onClick={() => handleLike(post._id)} style={{ background: 'transparent', color: isLiked ? '#e11d48' : '#666', padding:0, boxShadow:'none', display:'flex', alignItems:'center', gap:6, fontSize:'0.9rem' }}>{isLiked ? <FaHeart /> : <FaRegHeart />} {post.likes.length}</button>
                <span style={{ color: '#666', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:'0.9rem' }}><FaComment /> {post.comments.length}</span>
                <button onClick={() => handleShare(post)} style={{ background: 'transparent', color: 'var(--primary)', boxShadow:'none', padding:0, display:'flex', alignItems:'center', gap:6, fontSize:'0.9rem' }}><FaShare /></button>
              </div>
            </div>
            {post.comments.length > 0 && (
              <div style={{ background: '#f9fafb', padding: '15px 20px', borderTop: '1px solid #eee' }}>{post.comments.map((com, idx) => (<div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}><strong style={{ fontSize:'0.85em', color:'#333' }}>{com.author?.name}:</strong> <span style={{ fontSize:'0.9em', color:'#555' }}>{com.text}</span></div>))}</div>
            )}
            {user && (<div style={{ padding: '15px 20px', display: 'flex', gap: '10px', borderTop: '1px solid #eee', background:'#fff' }}><input placeholder="Écrire un commentaire..." value={commentText[post._id] || ''} onChange={e => setCommentText({...commentText, [post._id]: e.target.value})} style={{ marginBottom: 0, borderRadius:'25px', background:'#f0f2f5', border:'none' }} /><button onClick={() => handleComment(post._id)} style={{ borderRadius:'50%', width:'40px', height:'40px', padding:0, display:'flex', alignItems:'center', justifyContent:'center' }}><FaPaperPlane /></button></div>)}
          </div>
        );
      })}
    </div>
  );
}