import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaPen, FaSave, FaTimes, FaCamera, FaMapMarkerAlt, FaPhone, 
  FaGlobe, FaLock, FaSignOutAlt, FaFileAlt, FaHeart, FaComment, 
  FaTrash, FaCalendarCheck, FaEdit, FaUser, FaImages, FaCog, FaTrashAlt, FaClock, FaSpinner,
  FaBell, FaLanguage, FaKey, FaShieldAlt, FaChevronRight
} from 'react-icons/fa';

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); 
  const [myPosts, setMyPosts] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', bio: '', city: '', phone: '', isPublic: true,
    preferences: { notifications: true, language: 'fr' }
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '', 
        bio: user.bio || '', 
        city: user.city || '', 
        phone: user.phone || '',
        isPublic: user.isPublic !== undefined ? user.isPublic : true,
        preferences: user.preferences || { notifications: true, language: 'fr' }
      });
      fetchMyPosts(); fetchMyEvents();
    }
  }, [user]);

  const fetchMyPosts = async () => {
    try { const res = await fetch(`http://localhost:3002/posts/user/${user._id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) setMyPosts(await res.json()); } catch (err) { console.error(err); }
  };

  const fetchMyEvents = async () => {
    try { const res = await fetch(`http://localhost:3002/events/user/${user._id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) setMyEvents(await res.json()); } catch (err) { console.error(err); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData(); data.append('photo', file);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3002/auth/upload-photo', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data });
        if(res.ok) { toast.success("Avatar mis à jour !"); setTimeout(() => window.location.reload(), 1000); } 
        else { toast.error("Erreur upload"); setUploading(false); }
    } catch (err) { toast.error("Erreur serveur"); setUploading(false); }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData(); data.append('cover', file);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3002/auth/upload-cover', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: data });
        if(res.ok) { toast.success("Bannière mise à jour !"); setTimeout(() => window.location.reload(), 1000); } 
        else { toast.error("Erreur upload"); setUploading(false); }
    } catch (err) { toast.error("Erreur serveur"); setUploading(false); }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3002/auth/update', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(formData) });
    if (res.ok) { toast.success("Profil mis à jour !"); setIsEditing(false); setTimeout(() => window.location.reload(), 500); }
  };

  // Fonction spéciale pour mettre à jour la confidentialité depuis l'onglet Paramètres (sans recharger)
  const togglePublicProfile = async (newVal) => {
      setFormData(prev => ({ ...prev, isPublic: newVal }));
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3002/auth/update', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ ...formData, isPublic: newVal }) });
      toast.success(newVal ? "Profil visible pour tous" : "Profil privé");
  };

  const updatePreferences = async (newPrefs) => {
    setFormData(prev => ({ ...prev, preferences: newPrefs }));
    const t = localStorage.getItem('token');
    await fetch('http://localhost:3002/auth/update', { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${t}` }, body: JSON.stringify({ ...formData, preferences: newPrefs }) });
    toast.success("Préférence enregistrée");
  };

  const handleDeletePost = async (postId) => {
    if(!window.confirm("Supprimer ?")) return;
    await fetch(`http://localhost:3002/posts/${postId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    setMyPosts(myPosts.filter(p => p._id !== postId)); toast.info("Supprimé");
  };

  const handleDeleteEvent = async (eventId) => {
    if(!window.confirm("Supprimer ?")) return;
    await fetch(`http://localhost:3002/events/${eventId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    setMyEvents(myEvents.filter(e => e._id !== eventId)); toast.info("Supprimé");
  };

  const handleDeleteAccount = async () => {
    if(!window.confirm("⚠️ Action irréversible. Continuer ?")) return;
    try { const res = await fetch('http://localhost:3002/auth/delete', { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (res.ok) { logout(); navigate('/'); toast.success("Compte supprimé."); } } catch(err) {}
  };

  if (!user) return <div style={{textAlign:'center', marginTop:'50px'}}>Chargement...</div>;
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {month:'long', year:'numeric'}) : 'Novembre 2025';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom:'50px' }}>
      
      {/* --- 1. HEADER VISUEL --- */}
      <div className="profile-banner-container" style={{ backgroundImage: user.coverPhoto ? `url(${user.coverPhoto})` : 'linear-gradient(135deg, var(--secondary), #1a1a1a)' }}>
        <div className="profile-banner-overlay"></div>
        
        {isEditing && (
            <>
                <label htmlFor="coverInput" style={{ position:'absolute', top:20, right:20, background:'rgba(0,0,0,0.6)', color:'white', padding:'8px 15px', borderRadius:'25px', cursor:'pointer', display:'flex', alignItems:'center', gap:8, zIndex:20, border: '1px solid rgba(255,255,255,0.3)', fontSize:'0.85rem' }}>
                    {uploading ? <FaSpinner className="fa-spin" /> : <FaCamera />} {uploading ? "Envoi..." : "Changer Bannière"}
                </label>
                <input id="coverInput" type="file" onChange={handleCoverChange} style={{display:'none'}} accept="image/*" />
            </>
        )}
      </div>

      {/* --- 2. CARTE D'IDENTITÉ --- */}
      <div className="profile-main-card">
        <div className="profile-avatar-wrapper">
            <img src={user.photo || "https://via.placeholder.com/150"} className="profile-avatar-img" alt="Profil" />
            {isEditing && (
                <>
                    <label htmlFor="avatarInput" className="camera-btn">{uploading ? <FaSpinner className="fa-spin" /> : <FaCamera size={14} />}</label>
                    <input id="avatarInput" type="file" onChange={handleAvatarChange} style={{display:'none'}} accept="image/*" />
                </>
            )}
        </div>

        <div style={{ position:'absolute', top:20, right:20 }}>
            {!isEditing ? (
                <button onClick={() => { setIsEditing(true); setActiveTab('infos'); }} style={{ background:'#f3f4f6', color:'#333', borderRadius:'50%', width:'40px', height:'40px', padding:0, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #ddd' }}><FaPen /></button>
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
                {/* --- OPTION 1 : TOGGLE DANS LE HEADER (MODE ÉDITION) --- */}
                {isEditing ? (
                    <label style={{ display:'flex', alignItems:'center', gap:5, background:'#f0f0f0', padding:'5px 10px', borderRadius:'15px', cursor:'pointer' }}>
                        <input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} style={{width:'auto', margin:0}} />
                        <span style={{fontWeight:'bold', color: formData.isPublic ? 'green' : 'red', fontSize:'0.8em'}}>
                            {formData.isPublic ? "Public" : "Privé"}
                        </span>
                    </label>
                ) : (
                    <span style={{ display:'flex', alignItems:'center', gap:5 }}>{formData.isPublic ? <FaGlobe /> : <FaLock />} {formData.isPublic ? 'Public' : 'Privé'}</span>
                )}
                <span style={{ display:'flex', alignItems:'center', gap:5 }}><FaClock /> Membre depuis {joinDate}</span>
            </div>
        </div>

        <div className="profile-stats">
            <div className="stat-item"><span className="stat-value">{myPosts.length}</span><span className="stat-label">Posts</span></div>
            <div className="stat-item"><span className="stat-value">{myEvents.length}</span><span className="stat-label">Events</span></div>
            <div className="stat-item"><span className="stat-value" style={{color:'#10b981'}}>Actif</span><span className="stat-label">Statut</span></div>
        </div>
      </div>

      {/* --- 3. ONGLETS --- */}
      <div className="profile-tabs">
        <button onClick={() => setActiveTab('posts')} className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}><FaImages /> Publications</button>
        <button onClick={() => setActiveTab('infos')} className={`tab-btn ${activeTab === 'infos' ? 'active' : ''}`}><FaUser /> Infos</button>
        <button onClick={() => setActiveTab('events')} className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}><FaCalendarCheck /> Agenda</button>
        <button onClick={() => setActiveTab('settings')} className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}><FaCog /> Paramètres</button>
      </div>

      {/* --- 4. CONTENU --- */}
      
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

      {activeTab === 'infos' && (
        <div className="card" style={{ padding:'30px' }}>
            {/* --- OPTION 2 : TOGGLE DANS LES INFOS (MODE ÉDITION) --- */}
            {isEditing && (<div style={{ background:'#f9f9f9', padding:'10px', borderRadius:'8px', marginBottom:'20px', display:'flex', alignItems:'center', gap:10 }}><input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} style={{ width:'20px', margin:0 }} /><label style={{ fontSize:'0.9em', fontWeight:'bold' }}>Rendre mon profil Public</label></div>)}
            <div style={{ display: 'grid', gap: '20px' }}>
                <div><label style={{ fontWeight: 'bold', color: 'var(--primary)', display:'block', marginBottom:5 }}>Bio</label>{isEditing ? <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} style={{ minHeight:'80px' }} /> : <p style={{ fontStyle: 'italic', color: '#555' }}>{user.bio || "Pas de bio."}</p>}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div><label style={{ fontWeight: 'bold', color: 'var(--primary)', display:'block', marginBottom:5 }}>Ville</label>{isEditing ? <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} /> : <p>{user.city || "-"}</p>}</div>
                    <div><label style={{ fontWeight: 'bold', color: 'var(--primary)', display:'block', marginBottom:5 }}>Tél</label>{isEditing ? <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /> : <p>{user.phone || "-"}</p>}</div>
                </div>
            </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div style={{ display:'grid', gap:'20px' }}>
            {myEvents.length === 0 && <div style={{textAlign:'center', padding:'40px', color:'#999', background:'white', borderRadius:'10px'}}>Aucun événement.</div>}
            {myEvents.map(event => (
                <div key={event._id} className="card" style={{ padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft:'4px solid var(--primary)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'15px' }}><img src={event.images[0] || "https://via.placeholder.com/60"} alt="Event" style={{ width:'60px', height:'60px', borderRadius:'10px', objectFit:'cover' }} /><div><h4 style={{ margin:0, color:'#333' }}>{event.title}</h4><small style={{ color:'#666' }}>📅 {new Date(event.date).toLocaleDateString()}</small></div></div>
                    <div style={{ display:'flex', gap:'5px' }}><button onClick={() => navigate(`/edit-event/${event._id}`)} style={{ padding:'5px 8px', fontSize:'0.8em', background:'#eee', color:'#333' }}><FaEdit /></button><button onClick={() => handleDeleteEvent(event._id)} style={{ padding:'5px 8px', fontSize:'0.8em', background:'#fee2e2', color:'#dc2626' }}><FaTrash /></button></div>
                </div>
            ))}
        </div>
      )}

      {/* --- 5. ONGLET PARAMÈTRES (SETTINGS) --- */}
      {activeTab === 'settings' && (
        <div>
            <div className="settings-section">
                <div className="settings-title">Confidentialité</div>
                <div className="settings-list">
                    {/* --- OPTION 3 : TOGGLE PERMANENT DANS PARAMÈTRES --- */}
                    <div className="settings-item">
                        <div className="settings-label">
                            {formData.isPublic ? <FaGlobe style={{color:'#10b981'}} /> : <FaLock style={{color:'#dc2626'}} />} 
                            Profil Public
                        </div>
                        <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={formData.isPublic} 
                                onChange={(e) => togglePublicProfile(e.target.checked)} // Appel direct à l'API
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-title">Général</div>
                <div className="settings-list">
                    <div className="settings-item">
                        <div className="settings-label"><FaBell style={{color:'var(--primary)'}} /> Notifications</div>
                        <label className="switch">
                            <input type="checkbox" checked={formData.preferences?.notifications} onChange={(e) => updatePreferences({...formData.preferences, notifications: e.target.checked})} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="settings-item">
                        <div className="settings-label"><FaLanguage style={{color:'var(--primary)'}} /> Langue</div>
                        <select value={formData.preferences?.language} onChange={(e) => updatePreferences({...formData.preferences, language: e.target.value})} style={{ width:'auto', padding:'5px', margin:0 }}>
                            <option value="fr">Français</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <div className="settings-title">Sécurité</div>
                <div className="settings-list">
                    <div className="settings-item">
                        <div className="settings-label"><FaKey style={{color:'var(--secondary)'}} /> Mot de passe</div>
                        <Link to="/forgot-password" style={{ textDecoration:'none', color:'var(--primary)', fontSize:'0.9em', fontWeight:'bold', display:'flex', alignItems:'center', gap:5 }}>
                            Modifier <FaChevronRight />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding:'30px', textAlign:'center', marginTop:'30px' }}>
                <button onClick={logout} style={{ background: 'white', border:'1px solid #ef4444', color: '#ef4444', width: '100%', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    <FaSignOutAlt /> Déconnexion
                </button>
                <hr />
                <h4 style={{ color:'#dc2626', marginTop:'20px', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    <FaShieldAlt /> Zone de Danger
                </h4>
                <button onClick={handleDeleteAccount} style={{ background:'#fee2e2', color:'#dc2626', border:'none', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                    <FaTrashAlt /> Supprimer mon compte
                </button>
            </div>
        </div>
      )}

    </div>
  );
}