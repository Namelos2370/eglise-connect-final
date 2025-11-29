import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FaArrowLeft, FaUsers, FaCamera, FaPaperPlane, FaSmile, 
  FaInfoCircle, FaEllipsisV, FaTrash, FaCopy, FaTimes 
} from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import API_URL from '../config';
import ImageModal from '../components/ImageModal';

export default function GroupDetailsPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  
  // États Saisie
  const [newPost, setNewPost] = useState('');
  const [file, setFile] = useState(null);
  const [showPicker, setShowPicker] = useState(false); // Emoji
  
  // États Interface
  const [showInfo, setShowInfo] = useState(false); // Pour voir les membres/infos
  const [selectedImage, setSelectedImage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null); // Menu contextuel message
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchGroupData();
    // Rafraîchissement auto (Temps réel)
    const interval = setInterval(fetchGroupData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    // Scroll automatique en bas à l'arrivée de nouveaux messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  const fetchGroupData = async () => {
    const token = localStorage.getItem('token');
    try {
        const resGroup = await fetch(`${API_URL}/groups/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resGroup.ok) {
            const groupData = await resGroup.json();
            setGroup(groupData);
            
            // Si membre, on charge les messages
            const isMember = groupData.members.some(m => m._id === user?._id);
            if (isMember) {
                const resPosts = await fetch(`${API_URL}/posts/group/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (resPosts.ok) {
                    const newPosts = await resPosts.json();
                    // On met à jour seulement si ça a changé pour éviter de faire sauter le scroll
                    if (newPosts.length !== posts.length) setPosts(newPosts);
                }
            }
        }
    } catch (err) { console.error(err); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !file) return;
    
    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('groupId', id);
    if (file) formData.append('image', file);

    const token = localStorage.getItem('token');
    try {
        await fetch(`${API_URL}/posts`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData
        });
        setNewPost(''); setFile(null); setShowPicker(false); 
        fetchGroupData();
    } catch (err) { toast.error("Erreur envoi"); }
  };

  const handleDeletePost = async (postId) => {
    if(!window.confirm("Supprimer ce message ?")) return;
    const token = localStorage.getItem('token');
    await fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setPosts(posts.filter(p => p._id !== postId));
  };

  const handleCopy = (text) => {
      navigator.clipboard.writeText(text);
      toast.info("Copié !");
      setOpenMenuId(null);
  };

  const handleJoin = async () => {
      const token = localStorage.getItem('token');
      try {
          const res = await fetch(`${API_URL}/groups/${id}/join`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) fetchGroupData();
      } catch (e) { toast.error("Erreur"); }
  };

  if (!group) return <p style={{textAlign:'center', marginTop:50}}>Chargement...</p>;

  const isMember = group.members.some(m => m._id === user._id);

  // SI PAS MEMBRE : ÉCRAN D'ACCUEIL DU GROUPE
  if (!isMember) {
      return (
        <div style={{ maxWidth:'600px', margin:'50px auto', textAlign:'center', padding:'20px' }}>
            <div className="card" style={{ padding:'40px', borderTop:'5px solid var(--primary)' }}>
                {group.photo ? <img src={group.photo} style={{width:100, height:100, borderRadius:'50%', objectFit:'cover'}} alt="g"/> : <FaUsers size={80} color="#ccc"/>}
                <h1>{group.name}</h1>
                <p style={{color:'#666'}}>{group.description}</p>
                <p><strong>{group.members.length}</strong> membres participent.</p>
                <button onClick={handleJoin} className="btn-magic" style={{marginTop:20}}>Rejoindre le Groupe</button>
            </div>
        </div>
      );
  }

  // SI MEMBRE : INTERFACE CHAT WHATSAPP
  return (
    <div className="chat-container">
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
      
      {/* HEADER DU GROUPE */}
      <div className="chat-header">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <Link to="/groups" style={{ color:'#555' }}><FaArrowLeft /></Link>
            <div onClick={() => setShowInfo(true)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                {group.photo ? <img src={group.photo} style={{width:40, height:40, borderRadius:'50%', objectFit:'cover'}} alt="g"/> : <div style={{width:40, height:40, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}><FaUsers/></div>}
                <div>
                    <h3 style={{ margin:0, fontSize:'1rem', color:'#333' }}>{group.name}</h3>
                    <div style={{ fontSize:'0.75em', color:'var(--primary)' }}>{group.members.length} membres • Appuyer pour infos</div>
                </div>
            </div>
        </div>
        <FaEllipsisV style={{color:'#888', cursor:'pointer'}} onClick={() => setShowInfo(true)} />
      </div>

      {/* VOLET D'INFOS (SIDEBAR DROITE) */}
      <div className={`profile-sidebar ${showInfo ? 'open' : ''}`} style={{zIndex:3000}}>
        <button className="close-sidebar" onClick={() => setShowInfo(false)}><FaTimes /></button>
        <div className="sidebar-content">
            <h2>Infos du Groupe</h2>
            <p>{group.description}</p>
            <hr/>
            <h3>Membres ({group.members.length})</h3>
            <div style={{ textAlign:'left', maxHeight:'300px', overflowY:'auto' }}>
                {group.members.map(m => (
                    <Link key={m._id} to={`/user/${m._id}`} style={{display:'flex', alignItems:'center', gap:10, padding:10, textDecoration:'none', color:'#333', borderBottom:'1px solid #eee'}}>
                         <img src={m.photo || "https://via.placeholder.com/30"} style={{width:30, height:30, borderRadius:'50%'}} alt="m"/>
                         <span>{m.name}</span>
                    </Link>
                ))}
            </div>
            <button onClick={handleJoin} style={{background:'#fee2e2', color:'#dc2626', marginTop:20, width:'100%'}}>Quitter le groupe</button>
        </div>
      </div>

      {/* LISTE DES MESSAGES */}
      <div className="chat-messages">
        {posts.map((msg) => {
          const isMe = msg.author?._id === user?._id;
          const isMenuOpen = openMenuId === msg._id;

          return (
            <div key={msg._id} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
              {!isMe && <img src={msg.author?.photo || "https://via.placeholder.com/30"} className="user-avatar" style={{width:30, height:30, borderRadius:'50%'}} alt="av"/>}
              
              <div className="message-bubble" style={{position:'relative', minWidth:'100px'}}>
                 {/* Nom de l'auteur (si ce n'est pas moi) */}
                 {!isMe && <div style={{fontSize:'0.75em', fontWeight:'bold', color:'var(--primary)', marginBottom:2}}>{msg.author?.name}</div>}
                 
                 {/* Contenu (Texte + Image) */}
                 {msg.image && <img src={msg.image} alt="img" style={{width:'100%', borderRadius:10, marginBottom:5, cursor:'zoom-in'}} onClick={() => setSelectedImage(msg.image)} />}
                 <div>{msg.content}</div>
                 
                 {/* Heure */}
                 <div style={{fontSize:'0.65em', textAlign:'right', opacity:0.6, marginTop:3}}>{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>

                 {/* Menu contextuel (Copier/Supprimer) */}
                 <div className={`message-options-btn ${isMenuOpen ? 'active' : ''}`} onClick={() => setOpenMenuId(isMenuOpen ? null : msg._id)}><FaEllipsisV size={10} /></div>
                 {isMenuOpen && (
                    <div className="message-popup-menu" style={{ right: isMe ? 0 : 'auto', left: isMe ? 'auto' : 0 }}>
                        <div onClick={() => handleCopy(msg.content)} className="popup-item"><FaCopy/> Copier</div>
                        {isMe && <div onClick={() => handleDeletePost(msg._id)} className="popup-item delete"><FaTrash/> Supprimer</div>}
                    </div>
                 )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ZONE DE SAISIE */}
      <form onSubmit={handleSend} className="chat-input-area" style={{ position:'relative' }}>
        {showPicker && <div style={{position:'absolute', bottom:'70px', left:0, width:'100%', zIndex:100}}><EmojiPicker onEmojiClick={e => setNewPost(p => p + e.emoji)} width="100%" /></div>}
        
        <div style={{display:'flex', alignItems:'center', gap:10, width:'100%'}}>
            <button type="button" onClick={() => setShowPicker(!showPicker)} style={{background:'none', border:'none', fontSize:'1.5rem', color:'#f59e0b', padding:0}}><FaSmile/></button>
            <label style={{cursor:'pointer', display:'flex', alignItems:'center', color: file ? 'green':'#888'}}>
                <FaCamera size={22}/>
                <input type="file" onChange={e => setFile(e.target.files[0])} style={{display:'none'}} accept="image/*" />
            </label>
            <input 
                type="text" 
                value={newPost} 
                onChange={e => setNewPost(e.target.value)} 
                placeholder="Message..." 
                style={{ flex:1, padding:'12px', borderRadius:'25px', border:'1px solid #ddd', fontSize:'1rem' }}
            />
            <button type="submit" style={{ width:45, height:45, borderRadius:'50%', background:'var(--primary)', color:'white', border:'none', display:'flex', justifyContent:'center', alignItems:'center' }}>
                <FaPaperPlane />
            </button>
        </div>
      </form>
    </div>
  );
}