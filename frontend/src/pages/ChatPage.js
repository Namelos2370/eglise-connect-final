import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaPaperPlane, FaComments, FaCircle, FaLock, FaFire, FaUserCircle } from 'react-icons/fa';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewPost] = useState('');
  const { user } = useContext(AuthContext);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch('http://localhost:3002/messages');
      if (res.ok) {
        const data = await res.json();
        if (data.length > messages.length || messages.length === 0) {
            setMessages(data);
        }
      }
    } catch (err) { console.error(err); }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:3002/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newMessage })
      });
      setNewPost(''); fetchMessages();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="chat-container">
      
      {/* Header */}
      <div className="chat-header">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <FaComments style={{ fontSize: '1.5rem', color:'var(--primary)' }} />
            <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Groupe Communautaire</h3>
                <div style={{ fontSize: '0.75em', display:'flex', alignItems:'center', gap:5, color:'#10b981' }}>
                    <FaCircle style={{ fontSize: '0.6em' }} /> En ligne
                </div>
            </div>
        </div>
      </div>
      
      {/* Messages (Style Fil d'Or) */}
      <div className="chat-messages">
        {messages.map((msg) => {
          const isMe = user ? msg.sender?._id === user._id : false;
          return (
            <div key={msg._id} className={`message-wrapper ${isMe ? 'message-right' : 'message-left'}`}>
              
              {/* Avatar */}
              {!isMe && (
                 msg.sender?.photo ? 
                 <img src={msg.sender.photo} className="user-avatar" alt="Av" style={{ width: '35px', height: '35px', borderRadius: '50%', objectFit: 'cover', backgroundColor:'white' }} />
                 : <FaUserCircle className="user-avatar" style={{ fontSize: '35px', color: '#ccc', backgroundColor:'white', borderRadius:'50%' }} />
              )}
              
              {/* Bulle */}
              <div className="message-bubble">
                {!isMe && <div style={{ fontSize:'0.75em', color:'var(--primary)', fontWeight:'bold', marginBottom:'4px' }}>{msg.sender?.name || 'Anonyme'}</div>}
                <div>{msg.content}</div>
                <div style={{ fontSize: '0.7em', color: isMe ? 'rgba(255,255,255,0.8)' : '#999', textAlign: 'right', marginTop: '5px', display:'flex', justifyContent:'flex-end', gap:5, alignItems:'center' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {isMe && <FaFire title="Envoyé" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Saisie */}
      {user ? (
        <form onSubmit={handleSend} className="chat-input-area">
            <input type="text" value={newMessage} onChange={(e) => setNewPost(e.target.value)} placeholder="Message..." style={{ flex: 1, padding: '12px 20px', borderRadius: '25px', border: '1px solid #ccc', outline: 'none', fontSize: '1rem' }} />
            <button type="submit" style={{ width: '45px', height: '45px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow:'0 4px 10px rgba(223, 169, 46, 0.3)' }}><FaPaperPlane /></button>
        </form>
      ) : (
        <div style={{ padding: '20px', background: '#fdfbf7', textAlign:'center', borderTop:'1px solid #f0e6d2', color:'#666', flexShrink: 0 }}>
            <FaLock /> <Link to="/login" style={{ marginLeft:'5px', color:'var(--primary)', fontWeight:'bold' }}>Se connecter</Link> pour participer.
        </div>
      )}
    </div>
  );
}