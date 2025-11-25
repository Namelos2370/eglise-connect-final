import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FaPaperPlane, FaArrowLeft, FaCheckDouble, FaUserCircle, 
  FaInfoCircle, FaTimes, FaEllipsisV, FaTrash, FaPen, FaCopy, FaMapMarkerAlt, FaPhone
} from 'react-icons/fa';

export default function PrivateChatPage() {
  const { conversationId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // États
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  
  // États pour l'édition de message
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editContent, setEditContent] = useState('');
  
  // État pour le menu contextuel
  const [openMenuId, setOpenMenuId] = useState(null);

  // --- CORRECTION ICI : On déclare bien les deux références ---
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null); 

  // 1. Charger
  const fetchChatData = async () => {
    const token = localStorage.getItem('token');
    try {
      const resMsg = await fetch(`http://localhost:3002/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resMsg.ok) {
        const data = await resMsg.json();
        if (data.length !== messages.length && editingMsgId === null) {
            setMessages(data);
        }
      }

      if (!partner) {
        const resConv = await fetch('http://localhost:3002/conversations', { headers: { 'Authorization': `Bearer ${token}` } });
        if (resConv.ok) {
            const allConvs = await resConv.json();
            const currentConv = allConvs.find(c => c._id === conversationId);
            if (currentConv) {
                const other = currentConv.participants.find(p => p._id !== user._id);
                const resUser = await fetch(`http://localhost:3002/users/${other._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
                if (resUser.ok) setPartner(await resUser.json());
            }
        }
      }
    } catch (err) { console.error(err); }
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "auto" }); };

  useEffect(() => {
    fetchChatData();
    const interval = setInterval(() => {
        if (editingMsgId === null && openMenuId === null) fetchChatData(); 
    }, 2000);
    return () => clearInterval(interval);
  }, [conversationId, editingMsgId, openMenuId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // --- ACTIONS ---

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token');
    try {
        await fetch(`http://localhost:3002/conversations/${conversationId}/messages`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ content: newMessage })
        });
        setNewMessage(''); fetchChatData(); setTimeout(scrollToBottom, 100);
    } catch (err) { toast.error("Erreur envoi"); }
  };

  const handleDeleteConversation = async () => {
    if(!window.confirm("Supprimer toute la conversation ?")) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3002/conversations/${conversationId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    toast.info("Conversation supprimée");
    navigate('/inbox');
  };

  const handleDeleteMessage = async (msgId) => {
    if(!window.confirm("Effacer ce message ?")) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3002/conversations/message/${msgId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    setMessages(messages.filter(m => m._id !== msgId));
    setOpenMenuId(null);
  };

  const handleEditMessage = async () => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3002/conversations/message/${editingMsgId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: editContent })
    });
    setMessages(messages.map(m => m._id === editingMsgId ? { ...m, content: editContent } : m));
    setEditingMsgId(null);
    setOpenMenuId(null);
    toast.success("Modifié !");
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("Copié !");
    setOpenMenuId(null);
  };

  return (
    <div className="chat-container">
      
      {/* HEADER */}
      <div className="chat-header">
        <div style={{ display:'flex', alignItems:'center', gap:15 }}>
            <Link to="/inbox" style={{ color:'#555', fontSize:'1.1em' }}><FaArrowLeft /></Link>
            
            <div onClick={() => setShowSidebar(!showSidebar)} style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
                {partner?.photo ? (
                    <img src={partner.photo} alt="Av" style={{ width:35, height:35, borderRadius:'50%', objectFit:'cover', border:'2px solid var(--primary)' }} />
                ) : (
                    <FaUserCircle style={{ fontSize:'35px', color:'#ccc' }} />
                )}
                <div>
                    <h3 style={{ margin:0, fontSize:'1rem', color:'#333' }}>{partner?.name || 'Chargement...'}</h3>
                    <div style={{ fontSize:'0.75em', color:'var(--primary)', display:'flex', alignItems:'center', gap:4 }}>
                        <FaInfoCircle /> Infos
                    </div>
                </div>
            </div>
        </div>
        
        {/* Bouton Supprimer Conversation */}
        <button onClick={handleDeleteConversation} style={{ background:'transparent', color:'#dc2626', border:'none', padding:5 }}>
            <FaTrash title="Supprimer la discussion" />
        </button>
      </div>

      {/* SIDEBAR */}
      <div className={`profile-sidebar ${showSidebar ? 'open' : ''}`}>
        <button className="close-sidebar" onClick={() => setShowSidebar(false)}><FaTimes /></button>
        {partner && (
            <div className="sidebar-content">
                <img src={partner.photo || "https://via.placeholder.com/150"} className="sidebar-avatar" alt="Profil" />
                <h2 className="sidebar-name">{partner.name}</h2>
                <p style={{ color:'#888', fontSize:'0.9em', marginTop:0 }}>{partner.email}</p>
                <div className="sidebar-bio">"{partner.bio || "Aucune bio."}"</div>
                <div className="sidebar-info"><FaMapMarkerAlt style={{color:'var(--primary)'}}/> {partner.city || "Inconnue"}</div>
                <div className="sidebar-info"><FaPhone style={{color:'var(--primary)'}}/> {partner.phone || "Non renseigné"}</div>
                <Link to={`/user/${partner._id}`}><button style={{ marginTop:'20px', width:'100%', borderRadius:'20px' }}>Voir Profil</button></Link>
            </div>
        )}
      </div>

      {/* MESSAGES */}
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg) => {
          const isMe = msg.sender?._id === user?._id;
          const isMenuOpen = openMenuId === msg._id;

          return (
            <div key={msg._id} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
              {!isMe && (
                 msg.sender?.photo ? 
                 <img src={msg.sender.photo} className="user-avatar" alt="Av" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', backgroundColor:'white' }} />
                 : <FaUserCircle className="user-avatar" style={{ fontSize: '35px', color: '#ccc', backgroundColor:'white', borderRadius:'50%' }} />
              )}
              
              <div className="message-bubble" style={{ position: 'relative', minWidth: '120px' }}>
                
                {/* BOUTON MENU SÉCURISÉ (Géré par CSS) */}
                <div 
                    className={`message-options-btn ${isMenuOpen ? 'active' : ''}`}
                    onClick={() => setOpenMenuId(isMenuOpen ? null : msg._id)} 
                >
                    <FaEllipsisV size={12} />
                </div>

                {/* POPUP MENU */}
                {isMenuOpen && (
                    <div className="message-popup-menu" style={{ right: isMe ? 0 : 'auto', left: isMe ? 'auto' : 0 }}>
                        <div onClick={() => handleCopy(msg.content)} className="popup-item"><FaCopy style={{color:'#666'}} /> Copier</div>
                        {isMe && (
                            <>
                                <div onClick={() => { setEditingMsgId(msg._id); setEditContent(msg.content); setOpenMenuId(null); }} className="popup-item"><FaPen style={{color:'var(--primary)'}} /> Modifier</div>
                                <div onClick={() => handleDeleteMessage(msg._id)} className="popup-item delete"><FaTrash /> Supprimer</div>
                            </>
                        )}
                        <div onClick={() => setOpenMenuId(null)} className="popup-item close">Fermer</div>
                    </div>
                )}

                {/* CONTENU DU MESSAGE */}
                {editingMsgId === msg._id ? (
                    <div>
                        <textarea 
                            value={editContent} 
                            onChange={e => setEditContent(e.target.value)} 
                            style={{ width:'100%', padding:'8px', borderRadius:'5px', border:'none', marginBottom:'5px', color:'#333', fontSize:'0.95em', minHeight:'60px', resize:'none' }}
                        />
                        <div style={{ display:'flex', gap:5, justifyContent:'flex-end' }}>
                            <button onClick={() => setEditingMsgId(null)} style={{ padding:'4px 10px', fontSize:'0.75em', background:'rgba(0,0,0,0.2)', borderRadius:'15px', border:'none', color:'white', cursor:'pointer' }}>Annuler</button>
                            <button onClick={handleEditMessage} style={{ padding:'4px 10px', fontSize:'0.75em', background:'white', color:'var(--primary)', borderRadius:'15px', border:'none', cursor:'pointer', fontWeight:'bold' }}>OK</button>
                        </div>
                    </div>
                ) : (
                    <div style={{ paddingBottom: '5px' }}>{msg.content}</div>
                )}

                {/* META */}
                <div className="message-meta" style={{ color: isMe ? 'rgba(255,255,255,0.8)' : '#999' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {isMe && <FaCheckDouble style={{ fontSize:'0.9em', color: '#fff' }} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* SAISIE */}
      <form onSubmit={handleSend} className="chat-input-area">
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Message privé..." style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #e0e0e0', outline:'none', fontSize: '0.95rem' }} />
        <button type="submit" style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background:'var(--primary)', color:'white', border:'none', boxShadow:'0 4px 10px rgba(223, 169, 46, 0.3)' }}><FaPaperPlane /></button>
      </form>

    </div>
  );
}