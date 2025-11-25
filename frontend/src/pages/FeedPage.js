import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { FaCamera, FaPaperPlane, FaPen, FaTrash, FaHeart, FaRegHeart, FaComment, FaShare, FaSave, FaTimes, FaSearch, FaLock, FaFlag } from 'react-icons/fa';
import ImageModal from '../components/ImageModal';
import Spinner from '../components/Spinner';

export default function FeedPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [newPost, setNewPost] = useState('');
  const [file, setFile] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [commentText, setCommentText] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3002/posts');
      if (res.ok) setPosts(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkAuth = () => { if (!user) { toast.info("Connectez-vous !"); navigate('/login'); return false; } return true; };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!checkAuth()) return;
    if (!newPost.trim() && !file) return toast.warning("Post vide !");
    const formData = new FormData(); formData.append('content', newPost); if (file) formData.append('image', file);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:3002/posts', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
      if (res.ok) { toast.success('Publié !'); setNewPost(''); setFile(null); document.getElementById('fileInput').value = ""; fetchPosts(); }
    } catch (err) { toast.error("Erreur"); }
  };

  const saveEdit = async (postId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:3002/posts/${postId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content: editContent }) });
      if (res.ok) { toast.success("Modifié !"); setEditingPostId(null); fetchPosts(); }
    } catch (err) { toast.error("Erreur"); }
  };

  const handleDelete = async (postId) => {
    if(!window.confirm("Supprimer ?")) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3002/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    fetchPosts(); toast.info("Supprimé");
  };

  const handleLike = async (postId) => { if (checkAuth()) { const token = localStorage.getItem('token'); await fetch(`http://localhost:3002/posts/${postId}/like`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }); fetchPosts(); }};
  const handleComment = async (postId) => { if (checkAuth()) { const text = commentText[postId]; if (!text) return; const token = localStorage.getItem('token'); await fetch(`http://localhost:3002/posts/${postId}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ text }) }); setCommentText({ ...commentText, [postId]: '' }); fetchPosts(); }};
  const handleShare = (post) => { if (navigator.share) navigator.share({ title: `Post`, text: post.content, url: window.location.href }).catch(console.error); else { navigator.clipboard.writeText(`${post.author?.name}: "${post.content}"`); toast.info("Copié !"); }};

  if (loading) return <Spinner />;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', paddingBottom:'60px' }}>
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />

      {user ? (
        <div className="card">
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <img src={user?.photo || 'https://via.placeholder.com/50'} style={{width:50, height:50, borderRadius:'50%', objectFit:'cover'}} alt="moi" />
            <textarea placeholder={`Exprimez-vous, ${user?.name}...`} value={newPost} onChange={e => setNewPost(e.target.value)} style={{ marginBottom:0, height: '80px' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div>
                <label htmlFor="fileInput" style={{ cursor:'pointer', color:'var(--primary)', fontWeight:'bold', display:'flex', alignItems:'center', gap:5 }}><FaCamera /> Photo</label>
                <input id="fileInput" type="file" onChange={e => setFile(e.target.files[0])} style={{ display:'none' }} accept="image/*" />
                {file && <span style={{ marginLeft:'10px', fontSize:'0.8em', color:'green' }}>OK</span>}
            </div>
            <button onClick={handlePost} style={{ borderRadius:'20px' }}>Publier</button>
            </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign:'center', background:'#f9f9f9', border:'1px dashed #ccc' }}>
            <p style={{ color:'#666' }}><FaLock /> Connectez-vous pour publier.</p>
            <Link to="/login"><button>Se connecter</button></Link>
        </div>
      )}

      <div style={{ marginBottom:'20px', position:'relative' }}>
        <FaSearch style={{ position:'absolute', left:'15px', top:'12px', color:'#aaa' }} />
        <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft:'40px', borderRadius:'25px', border:'1px solid #ddd', width:'100%' }} />
      </div>

      {filteredPosts.map(post => {
        const isMyPost = user && post.author?._id === user._id;
        const isEditing = editingPostId === post._id;
        const isLiked = user && post.likes.includes(user._id);

        return (
          <div key={post._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <img src={post.author?.photo || 'https://via.placeholder.com/50'} style={{width:45, height:45, borderRadius:'50%', objectFit:'cover'}} alt="author" />
                <div>
                  <strong style={{ display:'block' }}>{post.author?.name}</strong>
                  <small style={{ color: '#888' }}>{new Date(post.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
              {isMyPost && !isEditing && (
                <div style={{ display:'flex', gap:'5px' }}>
                   <button onClick={() => { setEditingPostId(post._id); setEditContent(post.content); }} style={{ padding:'8px', background:'#eee', color:'#333' }}><FaPen /></button>
                   <button onClick={() => handleDelete(post._id)} style={{ padding:'8px', background:'#fee2e2', color:'#dc2626' }}><FaTrash /></button>
                </div>
              )}
            </div>

            <div style={{ padding: '0 20px 10px 20px' }}>
              {isEditing ? (
                <div>
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} style={{ width:'100%', minHeight:'80px' }} />
                  <div style={{ display:'flex', gap:'10px', marginTop:'10px' }}>
                    <button onClick={() => saveEdit(post._id)} style={{ background:'#10b981' }}>Sauvegarder</button>
                    <button onClick={() => setEditingPostId(null)} style={{ background:'#ccc', color:'#333' }}>Annuler</button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ whiteSpace: 'pre-wrap', fontSize: '1.05em' }}>{post.content}</p>
                  {post.image && (
                    <img src={post.image} alt="Post" style={{ width: '100%', borderRadius: '10px', marginTop:'10px', cursor:'zoom-in' }} onClick={() => setSelectedImage(post.image)} />
                  )}
                </>
              )}
            </div>

            <div style={{ padding: '10px 20px', borderTop: '1px solid #f0f0f0', display:'flex', justifyContent:'space-between', background:'#fafafa', alignItems:'center' }}>
              <div style={{ display:'flex', gap:20 }}>
                <button onClick={() => handleLike(post._id)} style={{ background: 'transparent', color: isLiked ? '#e11d48' : '#666', boxShadow:'none', padding:0, display:'flex', alignItems:'center', gap:5 }}>
                    {isLiked ? <FaHeart /> : <FaRegHeart />} {post.likes.length}
                </button>
                <span style={{ color: '#666', cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}><FaComment /> {post.comments.length}</span>
                <button onClick={() => handleShare(post)} style={{ background: 'transparent', color: 'var(--primary)', boxShadow:'none', padding:0, display:'flex', alignItems:'center', gap:5 }}>
                    <FaShare />
                </button>
              </div>
              
              {/* BOUTON SIGNALER (NOUVEAU) */}
              {!isMyPost && (
                <button 
                    onClick={() => {if(window.confirm("Signaler ce contenu ?")) toast.success("Signalement envoyé")}} 
                    style={{ background:'transparent', color:'#aaa', padding:0, boxShadow:'none' }} title="Signaler"
                >
                    <FaFlag />
                </button>
              )}
            </div>

            {post.comments.length > 0 && (
              <div style={{ background: '#f9f9f9', padding: '15px 20px', borderTop: '1px solid #eee' }}>
                {post.comments.map((com, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <strong style={{ fontSize:'0.85em' }}>{com.author?.name}:</strong> <span style={{ fontSize:'0.9em' }}>{com.text}</span>
                  </div>
                ))}
              </div>
            )}
            
            {user && (
                <div style={{ padding: '10px 20px', display: 'flex', gap: '10px', borderTop: '1px solid #eee' }}>
                <input placeholder="Commenter..." value={commentText[post._id] || ''} onChange={e => setCommentText({...commentText, [post._id]: e.target.value})} style={{ marginBottom: 0, borderRadius:'20px' }} />
                <button onClick={() => handleComment(post._id)} style={{ borderRadius:'20px', padding:'5px 15px' }}><FaPaperPlane /></button>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
}