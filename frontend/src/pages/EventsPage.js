import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlus, FaTrash, FaSearch, FaImage, FaComment, FaPaperPlane, FaClock } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import ImageModal from '../components/ImageModal';
import API_URL from '../config';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/events`);
      if (res.ok) setEvents(await res.json());
    } catch (err) { toast.error("Erreur chargement"); }
    setLoading(false);
  };

  const handleRSVP = async (eventId) => {
    if (!user) { toast.info("Connectez-vous !"); return navigate('/login'); }
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) { setEvents(prev => prev.map(e => e._id === eventId ? { ...e, attendees: data.attendees } : e)); toast.success(data.message); }
  };

  const handleDelete = async (eventId) => { if (!window.confirm("Supprimer ?")) return; const token = localStorage.getItem('token'); const res = await fetch(`${API_URL}/events/${eventId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (res.ok) { toast.success("Supprimé"); setEvents(events.filter(e => e._id !== eventId)); } };
  const toggleComments = (eventId) => setShowComments({ ...showComments, [eventId]: !showComments[eventId] });
  const handleComment = async (eventId) => { if (!user) return navigate('/login'); const text = commentText[eventId]; if (!text) return; const token = localStorage.getItem('token'); const res = await fetch(`${API_URL}/events/${eventId}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ text }) }); if (res.ok) { const updatedEvent = await res.json(); setEvents(prev => prev.map(e => e._id === eventId ? updatedEvent : e)); setCommentText({ ...commentText, [eventId]: '' }); setShowComments({ ...showComments, [eventId]: true }); } };

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '20px', maxWidth:'900px', margin:'0 auto' }}>
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
      
      <div style={{ textAlign:'center', marginBottom:'50px', background:'white', padding:'40px', borderRadius:'20px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color:'var(--secondary)', fontSize:'2rem', margin:0 }}><FaCalendarAlt style={{color:'var(--primary)'}} /> Agenda Communautaire</h2>
        <p style={{ color:'#888', margin:'10px 0 20px 0' }}>Ne manquez aucun moment fort.</p>
        
        <div style={{ position: 'relative', maxWidth:'500px', margin:'0 auto' }}>
            <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform:'translateY(-50%)', color: 'var(--primary)' }} />
            <input type="text" placeholder="Rechercher un événement..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width:'100%', padding:'15px 15px 15px 50px', borderRadius:'50px', border:'1px solid #eee', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', fontSize:'1rem', outline:'none' }} />
        </div>
        {user && (<div style={{ marginTop:'20px' }}><Link to="/create-event"><button style={{ borderRadius:'30px', padding:'10px 25px', display:'inline-flex', alignItems:'center', gap:8 }}><FaPlus /> Créer un événement</button></Link></div>)}
      </div>

      <div style={{ display:'grid', gap:'30px' }}>
        {filteredEvents.map(event => {
            const isMyEvent = user && event.organizer?._id === user._id;
            const mainImage = event.images && event.images.length > 0 ? event.images[0] : null;
            const dateObj = new Date(event.date);

            return (
            <div key={event._id} className="card" style={{ padding:0, overflow:'hidden', border:'none', display:'flex', flexDirection:'column', position:'relative' }}>
                
                {/* DATE BADGE (DESIGN TICKET) */}
                <div style={{ position:'absolute', top:20, left:20, background:'white', borderRadius:'12px', padding:'10px', textAlign:'center', boxShadow:'0 5px 15px rgba(0,0,0,0.2)', zIndex:10, minWidth:'60px' }}>
                    <div style={{ color:'#d00', fontWeight:'bold', fontSize:'0.9rem', textTransform:'uppercase' }}>{dateObj.toLocaleDateString('fr-FR', { month: 'short' })}</div>
                    <div style={{ fontSize:'1.8rem', fontWeight:'800', color:'#333', lineHeight:1 }}>{dateObj.getDate()}</div>
                </div>

                {mainImage ? (
                    <div style={{ height:'300px', overflow:'hidden', cursor:'zoom-in' }} onClick={() => setSelectedImage(mainImage)}>
                        <img src={mainImage} alt={event.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    </div>
                ) : (
                    <div style={{ height:'150px', background:'var(--secondary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}><FaImage style={{ fontSize:'4em', opacity:0.2 }} /></div>
                )}
                
                <div style={{ padding:'30px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
                        <div>
                            <span style={{background:'#f3f4f6', color:'#666', padding:'4px 10px', borderRadius:'5px', fontSize:'0.8em', fontWeight:'bold', textTransform:'uppercase'}}>{event.type}</span>
                            <h3 style={{ margin: '10px 0', color: '#333', fontSize:'1.8rem' }}>{event.title}</h3>
                        </div>
                        {isMyEvent && <button onClick={() => handleDelete(event._id)} style={{ background:'#fee2e2', color:'#dc2626', padding:'10px', borderRadius:'50%' }}><FaTrash /></button>}
                    </div>

                    <div style={{ display:'flex', gap:20, color:'#666', margin:'10px 0', fontSize:'1rem' }}>
                        <span style={{display:'flex', alignItems:'center', gap:5}}><FaClock style={{color:'var(--primary)'}}/> {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span style={{display:'flex', alignItems:'center', gap:5}}><FaMapMarkerAlt style={{color:'var(--primary)'}}/> {event.location}</span>
                    </div>
                    
                    <p style={{ color: '#555', lineHeight:'1.6', marginBottom:'25px' }}>{event.description}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                             <div style={{display:'flex'}}>
                                {event.attendees.slice(0,3).map((att, i) => (
                                    <img key={i} src={att.photo || "https://via.placeholder.com/30"} style={{width:35, height:35, borderRadius:'50%', border:'2px solid white', marginLeft: i>0?-10:0}} alt="att" />
                                ))}
                             </div>
                             <span style={{ fontSize: '0.9em', color: '#666' }}>{event.attendees.length} participants</span>
                        </div>
                        <div style={{ display:'flex', gap:10 }}>
                            <button onClick={() => toggleComments(event._id)} style={{ background:'white', border:'1px solid #eee', color:'#666' }}><FaComment /> {event.comments ? event.comments.length : 0}</button>
                            <button onClick={() => handleRSVP(event._id)} style={{ padding: '10px 25px', borderRadius:'25px', boxShadow:'0 4px 10px rgba(223,169,46,0.4)' }}>Je participe</button>
                        </div>
                    </div>

                    {showComments[event._id] && (
                        <div style={{ background:'#f9f9f9', padding:'20px', marginTop:'20px', borderRadius:'15px' }}>
                            {event.comments && event.comments.map((com, idx) => (<div key={idx} style={{ marginBottom:'10px', fontSize:'0.95em' }}><strong>{com.author?.name}: </strong> {com.text}</div>))}
                            {user && (<div style={{ display:'flex', gap:10, marginTop:'15px' }}><input placeholder="Poser une question..." value={commentText[event._id] || ''} onChange={e => setCommentText({...commentText, [event._id]: e.target.value})} style={{ margin:0, height:'45px', borderRadius:'25px', border:'none', paddingLeft:'20px' }} /><button onClick={() => handleComment(event._id)} style={{ width:'45px', padding:0, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%' }}><FaPaperPlane /></button></div>)}
                        </div>
                    )}
                </div>
            </div>
            );
        })}
      </div>
    </div>
  );
}