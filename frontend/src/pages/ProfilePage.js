import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate, Link } from 'react-router-dom';
import API_URL from '../config';
import { 
  FaPen, FaSave, FaTimes, FaCamera, FaGlobe, FaLock, FaSignOutAlt, 
  FaHeart, FaComment, FaTrash, FaCalendarCheck, FaUser, FaImages, FaCog, 
  FaTrashAlt, FaClock, FaSpinner, FaTh, FaHandHoldingHeart, FaPrayingHands, 
  FaYoutube, FaUsers, FaShieldAlt, FaMapMarkerAlt, FaPhone, FaBell, FaLanguage, FaKey
} from 'react-icons/fa';

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); 
  const [myPosts, setMyPosts] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', bio: '', city: '', phone: '', isPublic: true,
    preferences: { notifications: true, language: 'fr' }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '', bio: user.bio || '', city: user.city || '', phone: user.phone || '',
        isPublic: user.isPublic !== undefined ? user.isPublic : true,
        preferences: user.preferences || { notifications: true, language: 'fr' }
      });
      fetchMyPosts(); fetchMyEvents();
    }
  }, [user]);

  const fetchMyPosts = async () => { try { const res = await fetch(`${API_URL}/posts/user/${user._id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); if (res.ok) setMyPosts(await res.json()); } catch (err) { console.error(err); } };
  const fetchMyEvents = async () => { try { const res = await fetch(`${API_URL}/events/user/${user._id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); if (res.ok) setMyEvents(await res.json()); } catch (err) { console.error(err); } };
  const handleAvatarUpload = async (e) => { const f = e.target.files[0]; if(!f) return; setUploading(true); const d = new FormData(); d.append('photo', f); const t = localStorage.getItem('token'); try { const res = await fetch(`${API_URL}/auth/upload-photo`, { method: 'POST', headers: { 'Authorization': `Bearer ${t}` }, body: d }); if(res.ok) { toast.success("Avatar mis à jour !"); setTimeout(() => window.location.reload(), 1000); } else { toast.error("Erreur upload"); } } catch(err) { toast.error("Erreur serveur"); } setUploading(false); };
  const handleCoverUpload = async (e) => { const f = e.target.files[0]; if(!f) return; setUploading(true); const d = new FormData(); d.append('cover', f); const t = localStorage.getItem('token'); try { const res = await fetch(`${API_URL}/auth/upload-cover`, { method: 'POST', headers: { 'Authorization': `Bearer ${t}` }, body: d }); if(res.ok) { toast.success("Bannière mise à jour !"); setTimeout(() => window.location.reload(), 1000); } else { toast.error("Erreur upload"); } } catch(err) { toast.error("Erreur serveur"); } setUploading(false); };
  const handleSaveProfile = async () => { const t = localStorage.getItem('token'); const res = await fetch(`${API_URL}/auth/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` }, body: JSON.stringify(formData) }); if (res.ok) { toast.success("Profil mis à jour !"); setIsEditing(false); setTimeout(() => window.location.reload(), 500); } };
  const updatePreferences = async (newPrefs) => { setFormData(prev => ({ ...prev, preferences: newPrefs })); const t = localStorage.getItem('token'); await fetch(`${API_URL}/auth/update`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` }, body: JSON.stringify({ ...formData, preferences: newPrefs }) }); toast.success("Préférence enregistrée"); };
  const handleDeletePost = async (postId) => { if(!window.confirm("Supprimer ?")) return; await fetch(`${API_URL}/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); setMyPosts(myPosts.filter(p => p._id !== postId)); toast.info("Supprimé"); };
  const handleDeleteEvent = async (eventId) => { if(!window.confirm("Supprimer ?")) return; await fetch(`${API_URL}/events/${eventId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); setMyEvents(myEvents.filter(e => e._id !== eventId)); toast.info("Supprimé"); };
  const handleDeleteAccount = async () => { if(!window.confirm("⚠️ Action irréversible. Continuer ?")) return; try { const res = await fetch(`${API_URL}/auth/delete`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }); if (res.ok) { logout(); navigate('/'); toast.success("Compte supprimé."); } } catch(err) {} };

  if (!user) return <div style={{textAlign:'center', marginTop:'50px'}}>Chargement...</div>;
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {month:'long', year:'numeric'}) : 'Novembre 2025';

  const menuBtnStyle = {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '15px', background: 'white', borderRadius: '12px',
      marginBottom: '10px', textDecoration: 'none', color: '#333',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0'
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom:'50px' }}>
      
      {/* HEADER VISUEL */}
      <div className="profile-banner-container" style={{ backgroundImage: user.coverPhoto ? `url(${user.coverPhoto})` : 'linear-gradient(135deg, var(--secondary), #1a1a1a)' }}>
        <div className="profile-banner-overlay"></div>
        {isEditing && (
            <label style={{ position:'absolute', top:20, right:20, background:'rgba(0,0,0,0.6)', color:'white', padding:'8px 15px', borderRadius:'25px', cursor:'pointer', display:'flex', alignItems:'center', gap:8, zIndex:20, border: '1px solid rgba(255,255,255,0.3)', fontSize:'0.85rem' }}>
                {uploading ? <FaSpinner className="fa-spin" /> : <FaCamera />} {uploading ? "Envoi..." : "Changer Bannière"}
                <input type="file" onChange={handleCoverUpload} style={{display:'none'}} accept="image/*" />
            </label>
        )}
      </div>

      <div className="profile-main-card">
        <div className="profile-avatar-wrapper">
            <img src={user.photo || "https://via.placeholder.com/150"} className="profile-avatar-img" alt="Profil" />
            {isEditing && (
                <label className="camera-btn">{uploading ? <FaSpinner className="fa-spin" /> : <FaCamera size={14} />}<input type="file" onChange={handleAvatarUpload} style={{display:'none'}} accept="image/*" /></label>
            )}
        </div>

        <div style={{ position:'absolute', top:20, right:20 }}>
            {!isEditing ? (
                <button onClick={() => setIsEditing(true)} style={{ background:'#f3f4f6', color:'#333', borderRadius:'50%', width:'40px', height:'40px', padding:0, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #ddd' }}><FaPen /></button>
            ) : (
                <div style={{ display:'flex', gap:10 }}>
                    <button onClick={() => setIsEditing(false)} style={{ background:'#fee2e2', color:'#dc2626', padding:'8px 15px', fontSize:'0.8em', borderRadius:'20px', display:'flex', alignItems:'center', gap:5 }}><FaTimes /> Annuler</button>
                    <button onClick={handleSaveProfile} style={{ background:'#10b981', color:'white', padding:'8px 15px', fontSize:'0.8em', borderRadius:'20px', display:'flex', alignItems:'center', gap:5 }}><FaSave /> Sauver</button>
                </div>
            )}
        </div>

        <div style={{ marginTop:'15px' }}>
            {isEditing ? (
                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ fontSize:'1.8rem', fontWeight:'800', textAlign:'center', border:'none', borderBottom:'2px solid var(--primary)', color:'var(--secondary)', width:'100%', background:'transparent' }} />
            ) : (
                <h1 style={{ margin:0, fontSize:'1.8rem', color:'var(--secondary)' }}>{user.name}</h1>
            )}
            <p style={{ color:'#888', margin:'5px 0', fontSize:'0.95rem' }}>{user.email}</p>
            <div style={{ display:'flex', justifyContent:'center', gap:15, fontSize:'0.9rem', color:'#666', marginTop:'10px' }}>
                <span style={{ display:'flex', alignItems:'center', gap:5 }}>{formData.isPublic ? <FaGlobe /> : <FaLock />} {formData.isPublic ? 'Public' : 'Privé'}</span>
                <span style={{ display:'flex', alignItems:'center', gap:5 }}><FaClock /> Membre depuis {joinDate}</span>
            </div>
        </div>

        <div className="profile-stats">
            <div className="stat-item"><span className="stat-value">{myPosts.length}</span><span className="stat-label">Posts</span></div>
            <div className="stat-item"><span className="stat-value">{myEvents.length}</span><span className="stat-label">Events</span></div>
            <div className="stat-item"><span className="stat-value" style={{color:'#10b981'}}>Actif</span><span className="stat-label">Statut</span></div>
        </div>
      </div>

      {/* ONGLETS */}
      <div className="profile-tabs">
        <button onClick={() => setActiveTab('posts')} className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}><FaImages /> Posts</button>
        <button onClick={() => setActiveTab('menu')} className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}><FaTh /> Menu</button>
        <button onClick={() => setActiveTab('infos')} className={`tab-btn ${activeTab === 'infos' ? 'active' : ''}`}><FaUser /> Infos</button>
        <button onClick={() => setActiveTab('settings')} className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}><FaCog /> Paramètres</button>
      </div>

      {/* CONTENU */}
      
      {activeTab === 'posts' && (
        <div style={{ display:'grid', gap:'20px' }}>
            {myPosts.length === 0 && <div style={{textAlign:'center', padding:'40px', color:'#999', background:'white', borderRadius:'10px'}}>Aucune publication.</div>}
            {myPosts.map(post => (
                <div key={post._id} className="card" style={{ padding: '20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                        <small style={{ color:'#888' }}>{new Date(post.createdAt).toLocaleDateString()}</small>
                        <button onClick={() => handleDeletePost(post._id)} style={{ background:'transparent', color:'#dc2626', padding:0, width:'auto', boxShadow:'none' }}><FaTrash /></button>
                    </div>
                    <p>{post.content}</p>
                    {post.image && <img src={post.image} alt="Post" style={{ width: '100%', borderRadius: '10px', marginTop:'10px' }} />}
                    <div style={{ marginTop:'10px', color:'#888', fontSize:'0.9em' }}><FaHeart /> {post.likes.length} · <FaComment /> {post.comments.length}</div>
                </div>
            ))}
        </div>
      )}

      {/* --- ONGLET MENU : ACCÈS AUX AUTRES FONCTIONS --- */}
      {activeTab === 'menu' && (
        <div style={{ padding:'10px' }}>
            <h3 style={{ color:'#888', fontSize:'0.9em', textTransform:'uppercase', marginBottom:'15px' }}>Accès Rapide</h3>
            
            {/* LE LIEN SOUTENIR EST ICI */}
            <Link to="/donations" style={menuBtnStyle}>
                <span style={{display:'flex', alignItems:'center', gap:10}}><FaHandHoldingHeart style={{color:'var(--primary)'}} /> Soutenir l'App</span>
                <span style={{color:'#ccc'}}>&gt;</span>
            </Link>
            
            <Link to="/prayers" style={menuBtnStyle}>
                <span style={{display:'flex', alignItems:'center', gap:10}}><FaPrayingHands style={{color:'var(--primary)'}} /> Mur de Prières</span>
                <span style={{color:'#ccc'}}>&gt;</span>
            </Link>
            
            <Link to="/sermons" style={menuBtnStyle}>
                <span style={{display:'flex', alignItems:'center', gap:10}}><FaYoutube style={{color:'var(--primary)'}} /> Médias & Sermons</span>
                <span style={{color:'#ccc'}}>&gt;</span>
            </Link>
            
            <Link to="/members" style={menuBtnStyle}>
                <span style={{display:'flex', alignItems:'center', gap:10}}><FaUsers style={{color:'var(--primary)'}} /> Communauté</span>
                <span style={{color:'#ccc'}}>&gt;</span>
            </Link>

            {user.role === 'admin' && (
                <Link to="/admin" style={{...menuBtnStyle, border:'1px solid #dc2626', color:'#dc2626', background:'#fff5f5'}}>
                    <span style={{display:'flex', alignItems:'center', gap:10}}><FaShieldAlt /> Administration</span>
                    <span>&gt;</span>
                </Link>
            )}
        </div>
      )}

      {activeTab === 'infos' && (
        <div className="card" style={{ padding:'30px' }}>
            {isEditing && (<div style={{ background:'#f9f9f9', padding:'10px', borderRadius:'8px', marginBottom:'20px', display:'flex', alignItems:'center', gap:10 }}><input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} style={{ width:'20px', margin:0 }} /><label style={{ fontSize:'0.9em' }}>Profil Public</label></div>)}
            <div style={{ display: 'grid', gap: '20px' }}>
                <div><label style={{ fontWeight: 'bold', color: 'var(--primary)', display:'block', marginBottom:5 }}>Bio</label>{isEditing ? <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ minHeight:'80px' }} /> : <p style={{ fontStyle: 'italic', color: '#555' }}>{user.bio || "Pas de bio."}</p>}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><label style={{ fontWeight: 'bold', color: 'var(--primary)', display:'block', marginBottom:5 }}>Ville</label>{isEditing ? <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /> : <p>{user.city || "-"}</p>}</div>
                    <div><label style={{ fontWeight: 'bold', color: 'var(--primary)', display:'block', marginBottom:5 }}>Tél</label>{isEditing ? <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /> : <p>{user.phone || "-"}</p>}</div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card" style={{ padding:'30px', textAlign:'center' }}>
            <h3>Paramètres</h3>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, background:'#f9f9f9', padding:15, borderRadius:10 }}>
                <span>Notifications</span>
                <label className="switch"><input type="checkbox" checked={formData.preferences?.notifications} onChange={(e) => updatePreferences({...formData.preferences, notifications: e.target.checked})} /><span className="slider"></span></label>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, background:'#f9f9f9', padding:15, borderRadius:10 }}>
                <span>Langue</span>
                <select value={formData.preferences?.language} onChange={(e) => updatePreferences({...formData.preferences, language: e.target.value})} style={{width:'auto', margin:0}}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                </select>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, background:'#f9f9f9', padding:15, borderRadius:10 }}>
                 <span>Mot de passe</span>
                 <Link to="/forgot-password" style={{textDecoration:'none', fontWeight:'bold', color:'var(--primary)'}}>Modifier</Link>
            </div>

            <button onClick={logout} style={{ background: 'white', border:'1px solid #ef4444', color: '#ef4444', width: '100%', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><FaSignOutAlt /> Déconnexion</button>
            <hr />
            <h4 style={{ color:'#dc2626', marginTop:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><FaShieldAlt /> Zone de Danger</h4>
            <button onClick={handleDeleteAccount} style={{ background:'#fee2e2', color:'#dc2626', border:'none', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}><FaTrashAlt /> Supprimer mon compte</button>
        </div>
      )}

    </div>
  );
}