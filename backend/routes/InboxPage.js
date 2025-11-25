import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaChevronRight, FaPlus, FaCommentDots } from 'react-icons/fa';

export default function InboxPage() {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:3002/conversations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setConversations(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchConversations();
  }, []);

  // Fonction pour formater la date intelligemment (Auj, Hier, ou Date)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  // Filtrage
  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p._id !== user._id);
    return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      
      {/* EN-TÊTE AVEC BOUTON NOUVEAU */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, display:'flex', alignItems:'center', gap:10 }}>
            <FaCommentDots style={{ color:'var(--primary)' }}/> Discussions
        </h2>
        <Link to="/members">
            <button style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.9em', padding:'8px 15px', borderRadius:'20px' }}>
                <FaPlus /> Nouvelle
            </button>
        </Link>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <FaSearch style={{ position: 'absolute', left: '15px', top: '12px', color: '#aaa' }} />
        <input 
            type="text" 
            placeholder="Rechercher une discussion..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '40px', borderRadius: '25px', border: '1px solid #eee', width: '100%', margin: 0, background:'white', boxShadow:'0 2px 5px rgba(0,0,0,0.02)' }} 
        />
      </div>
      
      {/* LISTE DES CONVERSATIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', padding: '40px', background:'white', borderRadius:'10px' }}>
                <p>Aucune conversation trouvée.</p>
                <Link to="/members" style={{ color:'var(--primary)', fontWeight:'bold' }}>Démarrer un chat</Link>
            </div>
        ) : (
            filteredConversations.map(conv => {
                const otherUser = conv.participants.find(p => p._id !== user._id) || { name: 'Utilisateur inconnu' };
                
                return (
                <Link to={`/private-chat/${conv._id}`} key={conv._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div 
                        className="card" 
                        style={{ 
                            padding: '15px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '15px',
                            transition: 'transform 0.2s, border-color 0.2s',
                            marginBottom: 0,
                            borderLeft: '4px solid transparent'
                        }}
                        onMouseEnter={(e) => { 
                            e.currentTarget.style.transform = 'translateX(5px)'; 
                            e.currentTarget.style.borderLeft = '4px solid var(--primary)';
                        }}
                        onMouseLeave={(e) => { 
                            e.currentTarget.style.transform = 'translateX(0)'; 
                            e.currentTarget.style.borderLeft = '4px solid transparent';
                        }}
                    >
                        {/* AVATAR */}
                        {otherUser.photo ? (
                            <img src={otherUser.photo} alt={otherUser.name} style={{ width: '55px', height: '55px', borderRadius: '50%', objectFit: 'cover', border:'2px solid #eee' }} />
                        ) : (
                            <FaUserCircle style={{ fontSize: '55px', color: '#ccc' }} />
                        )}

                        {/* CONTENU CENTRAL */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.05em', color:'#333' }}>{otherUser.name}</h3>
                                <small style={{ color: 'var(--primary)', fontWeight:'bold', fontSize:'0.8em' }}>
                                    {formatDate(conv.lastMessageDate)}
                                </small>
                            </div>
                            
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {conv.lastMessage}
                            </p>
                        </div>

                        {/* FLÈCHE D'ACTION */}
                        <div style={{ color:'#ddd' }}>
                            <FaChevronRight />
                        </div>
                    </div>
                </Link>
                );
            })
        )}
      </div>
    </div>
  );
}