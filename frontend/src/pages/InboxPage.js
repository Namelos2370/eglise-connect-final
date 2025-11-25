import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaSearch, FaChevronRight, FaPlus, FaCommentDots, FaEnvelopeOpenText, FaUser } from 'react-icons/fa';

// --- SOUS-COMPOSANT AVATAR SÉCURISÉ ---
// Il gère lui-même l'erreur d'image sans faire planter la page
const AvatarSafe = ({ src, alt }) => {
  const [error, setError] = useState(false);

  // Si on a une image et pas d'erreur, on l'affiche
  if (src && !error) {
    return (
      <img 
        src={src} 
        alt={alt} 
        onError={() => setError(true)} // Si ça plante, on passe en mode erreur
        className="user-avatar-img"
      />
    );
  }

  // Sinon (pas d'image ou erreur), on affiche l'icône par défaut
  return (
    <div className="user-avatar-fallback" style={{ display: 'flex' }}> {/* Force le display flex */}
      <FaUser style={{ fontSize: '25px', color: '#ccc' }} />
    </div>
  );
};

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    return isToday ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    const otherUser = conv.participants.find(p => p._id !== user?._id);
    const nameToSearch = otherUser?.name ? otherUser.name.toLowerCase() : "utilisateur inconnu";
    const search = searchTerm.toLowerCase();
    return nameToSearch.includes(search);
  });

  return (
    <div style={{ 
        maxWidth: '800px', margin: '0 auto', background: '#fdfbf7', backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")', minHeight: '80vh', padding: '30px 20px', borderRadius: '15px'
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h2 style={{ margin: 0, color:'var(--secondary)', fontSize:'1.8rem' }}>Mes Échanges</h2>
            <p style={{ margin:'5px 0 0 0', color:'#888', fontSize:'0.9rem' }}>Restez connecté avec la communauté</p>
        </div>
        <Link to="/members">
            <button style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 20px', borderRadius:'30px', boxShadow:'0 4px 10px rgba(223, 169, 46, 0.3)' }}>
                <FaPlus /> <span style={{fontSize:'0.9em'}}>Nouveau</span>
            </button>
        </Link>
      </div>

      <div style={{ position: 'relative', marginBottom: '40px' }}>
        <FaSearch style={{ position: 'absolute', left: '25px', top: '18px', color: 'var(--primary)', fontSize:'1.2em' }} />
        <input 
            type="text" 
            placeholder="Rechercher une conversation..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '60px', borderRadius: '15px', border: 'none', width: '100%', margin: 0, background:'white', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', height: '55px', fontSize: '1.1rem', color: '#555' }} 
        />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: '60px 20px', background:'white', borderRadius:'20px', boxShadow:'0 5px 20px rgba(0,0,0,0.03)' }}>
                <FaEnvelopeOpenText style={{ fontSize:'4rem', color:'#eee', marginBottom:'20px' }} />
                <p style={{ fontSize:'1.1em' }}>Aucune conversation trouvée.</p>
                <Link to="/members" style={{ color:'var(--primary)', fontWeight:'bold', textDecoration:'none', borderBottom:'2px solid var(--primary)' }}>Commencer une discussion</Link>
            </div>
        ) : (
            filteredConversations.map(conv => {
                const otherUser = conv.participants.find(p => p._id !== user?._id) || { name: 'Inconnu' };
                
                return (
                <Link to={`/private-chat/${conv._id}`} key={conv._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="conversation-card">
                        <div className="gold-bar"></div>

                        {/* UTILISATION DU COMPOSANT AVATAR SÉCURISÉ */}
                        <div style={{ flexShrink: 0, width: '65px', height: '65px' }}>
                            <AvatarSafe src={otherUser.photo} alt={otherUser.name} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                                <h3 style={{ margin: 0, fontSize: '1.15em', color:'#222', fontWeight:'700' }}>{otherUser.name || 'Inconnu'}</h3>
                                <span style={{ fontSize:'0.75em', color:'#999', background:'#f9f9f9', padding:'4px 10px', borderRadius:'10px' }}>{formatDate(conv.lastMessageDate)}</span>
                            </div>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.95em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', opacity:0.8 }}>{conv.lastMessage}</p>
                        </div>

                        <div style={{ color:'#eee' }}><FaChevronRight /></div>
                    </div>
                </Link>
                );
            })
        )}
      </div>
    </div>
  );
}