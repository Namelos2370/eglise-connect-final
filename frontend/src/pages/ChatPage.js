import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaPaperPlane, FaUserCircle, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import API_URL from '../config';

export default function ChatPage() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchMessages(); const i = setInterval(fetchMessages, 3000); return () => clearInterval(i); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const fetchMessages = async () => {
    try { const res = await fetch(`${API_URL}/messages`); if (res.ok) setMessages(await res.json()); } catch (err) { console.error(err); }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/messages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage })
      });
      setNewMessage(''); setShowPicker(false); fetchMessages();
    } catch (err) { toast.error("Erreur envoi"); }
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
    // On ne ferme pas le picker pour permettre d'en mettre plusieurs (ergonomie)
  };

  return (
    <div className="chat-container">
      {/* BACKDROP POUR FERMER LE PICKER */}
      {showPicker && <div className="emoji-backdrop" onClick={() => setShowPicker(false)}></div>}

      <div className="chat-header">
        <h2 style={{ margin:0, color:'var(--secondary)' }}>Chat Global</h2>
        <span style={{ fontSize:'0.8em', color:'#888' }}>Communauté en direct</span>
      </div>
      
      <div className="chat-messages">
        {messages.map((msg) => {
          const isMe = msg.sender?._id === user?._id;
          return (
            <div key={msg._id} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
              {!isMe && (msg.sender?.photo ? <img src={msg.sender.photo} className="user-avatar" alt="Av" style={{ width:35, height:35, borderRadius:'50%', objectFit:'cover' }} /> : <FaUserCircle className="user-avatar" style={{ fontSize:'35px', color:'#ccc', background:'white', borderRadius:'50%' }} />)}
              <div className="message-bubble">
                {!isMe && <div style={{ fontSize:'0.75em', fontWeight:'bold', color:'var(--primary)', marginBottom:2 }}>{msg.sender?.name}</div>}
                {msg.content}
                <div style={{ fontSize:'0.7em', opacity:0.6, textAlign:'right', marginTop:5 }}>{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area" style={{ position:'relative' }}>
        {/* SÉLECTEUR EMOJI PRO */}
        {showPicker && (
            <div className="emoji-picker-container">
                <EmojiPicker 
                    onEmojiClick={onEmojiClick} 
                    width="300px" 
                    height="400px" 
                    searchDisabled={true} // Plus sobre sans la barre de recherche
                    previewConfig={{ showPreview: false }} // Retire la prévisualisation en bas (plus propre)
                />
            </div>
        )}
        
        <button type="button" onClick={() => setShowPicker(!showPicker)} style={{ background:'transparent', border:'none', color: showPicker ? 'var(--primary)' : '#ccc', fontSize:'1.5rem', padding:0, cursor:'pointer', width:'auto', transition:'color 0.2s' }}>
            <FaSmile />
        </button>
        
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Message public..." style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #e0e0e0', outline:'none' }} />
        <button type="submit" style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background:'var(--primary)', color:'white', border:'none' }}><FaPaperPlane /></button>
      </form>
    </div>
  );
}