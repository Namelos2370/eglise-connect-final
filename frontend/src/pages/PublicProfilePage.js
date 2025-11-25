import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaComments, FaMapMarkerAlt, FaPhone, FaLock, FaPaperPlane, FaTimes, FaHeart, FaComment } from 'react-icons/fa';

export default function PublicProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // Posts de l'autre utilisateur
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`http://localhost:3002/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setProfile(data);
            // Si public, on charge aussi ses posts
            if (data.isPublic !== false) {
                fetchUserPosts(token);
            }
        }
        else toast.error("Profil introuvable");
      } catch (err) { toast.error("Erreur chargement"); }
    };
    fetchProfile();
  }, [userId]);

  const fetchUserPosts = async (token) => {
    try {
        const res = await fetch(`http://localhost:3002/posts/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setUserPosts(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleStartChat = async () => {
    const token = localStorage.getItem('token');
    if (profile.isPublic) {
        try {
            const res = await fetch(`http://localhost:3002/conversations/init/${userId}`, {
                method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                navigate(`/private-chat/${data.conversation._id}`);
            }
        } catch (err) { toast.error("Erreur chat"); }
    } else {
        setShowModal(true);
    }
  };

  const sendInvitation = async () => {
    if (!inviteMessage.trim()) return toast.warning("Message vide");
    const token = localStorage.getItem('token');
    try {
        const resConv = await fetch(`http://localhost:3002/conversations/init/${userId}`, {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resConv.ok) {
            const data = await resConv.json();
            const resMsg = await fetch(`http://localhost:3002/conversations/${data.conversation._id}/messages`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: inviteMessage })
            });
            if (resMsg.ok) {
                toast.success("Envoyé !"); setShowModal(false); navigate(`/private-chat/${data.conversation._id}`);
            } else {
                const err = await resMsg.json();
                if (err.error && err.error.includes("Invitation")) navigate(`/private-chat/${data.conversation._id}`);
                else toast.error("Erreur");
            }
        }
    } catch (err) { toast.error("Erreur"); }
  };

  if (!profile) return <div style={{textAlign:'center', marginTop:'50px'}}>Chargement...</div>;
  const isPrivate = profile.isPublic === false;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', position:'relative' }}>
      
      {showModal && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
            <div className="card" style={{ width:'90%', maxWidth:'400px', padding:'25px' }}>
                <h3>Invitation</h3>
                <textarea value={inviteMessage} onChange={e => setInviteMessage(e.target.value)} placeholder="Message..." style={{ width:'100%', minHeight:'100px' }} />
                <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'10px' }}>
                    <button onClick={() => setShowModal(false)} style={{ background:'#ccc', color:'#333' }}>Annuler</button>
                    <button onClick={sendInvitation}><FaPaperPlane /> Envoyer</button>
                </div>
            </div>
        </div>
      )}

      <Link to="/members" style={{ textDecoration: 'none', color: '#666', display:'flex', alignItems:'center', gap:5, marginBottom:'20px' }}><FaArrowLeft /> Retour</Link>

      <div className="card" style={{ textAlign: 'center', padding:'40px' }}>
        <img src={profile.photo || "https://via.placeholder.com/150"} alt={profile.name} style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)', marginBottom: '15px', filter: isPrivate ? 'grayscale(100%)' : 'none' }} />
        <h2 style={{ margin: '0 0 5px 0' }}>{profile.name}</h2>
        
        {isPrivate ? (
            <div style={{ background:'#fff5f5', color:'#c53030', padding:'20px', borderRadius:'10px', marginTop:'20px', border:'1px solid #feb2b2' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontWeight:'bold' }}><FaLock /> Profil Privé</div>
                <div style={{ marginTop: '20px' }}><button onClick={handleStartChat}><FaComments /> Invitation</button></div>
            </div>
        ) : (
            <>
                <p style={{ color: '#666' }}>{profile.email}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
                    {profile.city && <span style={{ background: '#fffbe6', color: 'var(--primary)', padding: '5px 15px', borderRadius: '20px' }}><FaMapMarkerAlt /> {profile.city}</span>}
                    {profile.phone && <span style={{ background: '#f0fff4', color: '#2f855a', padding: '5px 15px', borderRadius: '20px' }}><FaPhone /> {profile.phone}</span>}
                </div>
                <p style={{ fontStyle: 'italic', color: '#555' }}>{profile.bio || "Pas de bio."}</p>
                <div style={{ marginTop: '30px' }}><button onClick={handleStartChat}><FaComments /> Message</button></div>
            </>
        )}
      </div>

      {/* LISTE DES POSTS DE L'UTILISATEUR (Si Public) */}
      {!isPrivate && userPosts.length > 0 && (
        <div style={{ marginTop: '40px' }}>
            <h3 style={{ borderBottom:'2px solid var(--primary)', paddingBottom:'5px', display:'inline-block' }}>Publications de {profile.name}</h3>
            {userPosts.map(post => (
                <div key={post._id} className="card" style={{ padding:'20px', marginTop:'15px' }}>
                    <small style={{ color:'#888' }}>{new Date(post.createdAt).toLocaleDateString()}</small>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
                    {post.image && <img src={post.image} alt="Post" style={{ width: '100%', borderRadius: '10px' }} />}
                    <div style={{ marginTop:'10px', display:'flex', gap:'15px', color:'#666' }}>
                        <span><FaHeart /> {post.likes.length}</span>
                        <span><FaComment /> {post.comments.length}</span>
                    </div>
                </div>
            ))}
        </div>
      )}

    </div>
  );
}