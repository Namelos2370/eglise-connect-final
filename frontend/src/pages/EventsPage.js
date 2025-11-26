import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaPlus, FaTrash, FaSearch, FaImage, FaComment, FaPaperPlane } from 'react-icons/fa';
import Spinner from '../components/Spinner';
import ImageModal from '../components/ImageModal';
import API_URL from '../config'; // <--- IMPORT

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
      const res = await fetch(`${API_URL}/events`); // UTILISATION DE API_URL
      if (res.ok) setEvents(await res.json());
    } catch (err) { toast.error("Erreur de chargement"); }
    setLoading(false);
  };

  const handleRSVP = async (eventId) => {
    if (!user) { toast.info("Connectez-vous !"); return navigate('/login'); }
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (res.ok) {
        setEvents(prev => prev.map(e => e._id === eventId ? { ...e, attendees: data.attendees } : e));
        toast.success(data.message);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Supprimer ?")) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/events/${eventId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    if (res.ok) { toast.success("Supprimé"); setEvents(events.filter(e => e._id !== eventId)); }
  };

  const toggleComments = (eventId) => setShowComments({ ...showComments, [eventId]: !showComments[eventId] });

  const handleComment = async (eventId) => {
    if (!user) return navigate('/login');
    const text = commentText[eventId];
    if (!text) return;
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/events/${eventId}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ text }) });
    if (res.ok) {
        const updatedEvent = await res.json();
        setEvents(prev => prev.map(e => e._id === eventId ? updatedEvent : e));
        setCommentText({ ...commentText, [eventId]: '' });
        setShowComments({ ...showComments, [eventId]: true });
    }
  };

  const filteredEvents = events.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <Spinner />;

  return (
    <div style={{ padding: '20px', maxWidth:'800px', margin:'0 auto' }}>
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
      <div style={{ marginBottom:'30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin:0 }}><FaCalendarAlt style={{marginRight:10}} /> Événements</h2>
            {user && <Link to="/create-event"><button style={{ width: 'auto', display:'flex', alignItems:'center', gap:5 }}><FaPlus /> Créer</button></Link>}
        </div>
        <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '15px', top: '12px', color: '#aaa' }} />
            <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '40px', borderRadius: '25px', border: '1px solid #ccc', width:'100%', margin:0 }} />
        </div>
      </div>
      {filteredEvents.map(event => {
        const isMyEvent = user && event.organizer?._id === user._id;
        const mainImage = event.images && event.images.length > 0 ? event.images[0] : null;
        return (
          <div key={event._id} className="card" style={{ padding:0, overflow:'hidden', border:'none', marginBottom:'25px' }}>
            {mainImage ? (
                <div style={{ height:'200px', overflow:'hidden', position:'relative', cursor:'zoom-in' }} onClick={() => setSelectedImage(mainImage)}>
                    <img src={mainImage} alt={event.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.7)', color:'white', padding:'5px 10px', borderRadius:'20px', fontSize:'0.8em' }}>{event.type}</div>
                </div>
            ) : (
                <div style={{ height:'100px', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}><FaImage style={{ fontSize:'3em', opacity:0.5 }} /></div>
            )}
            <div style={{ padding:'20px' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#333' }}>{event.title}</h3>
                <p style={{ color: '#555', fontSize: '0.9em', lineHeight:'1.6' }}><strong>{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour:'2-digit', minute:'2-digit' })}</strong> à {event.location}</p>
                <p style={{ margin: '15px 0', color:'#666' }}>{event.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '15px', marginTop:'15px' }}>
                    <span style={{ fontSize: '0.9em', color: '#666' }}><FaUsers /> {event.attendees.length}</span>
                    <div style={{ display:'flex', gap:10 }}>
                        <button onClick={() => toggleComments(event._id)} style={{ background:'transparent', color:'#666', padding:0, boxShadow:'none' }}><FaComment /> {event.comments ? event.comments.length : 0}</button>
                        {isMyEvent && <button onClick={() => handleDelete(event._id)} style={{ background:'transparent', color:'#dc2626', padding:0, boxShadow:'none' }}><FaTrash /></button>}
                        <button onClick={() => handleRSVP(event._id)} style={{ padding: '8px 15px', fontSize:'0.8em' }}>Participer</button>
                    </div>
                </div>
                {showComments[event._id] && (
                    <div style={{ background:'#f9f9f9', padding:'15px', marginTop:'15px', borderRadius:'10px' }}>
                        {event.comments && event.comments.map((com, idx) => (<div key={idx} style={{ marginBottom:'10px', fontSize:'0.9em' }}><strong>{com.author?.name}: </strong> {com.text}</div>))}
                        {user && (<div style={{ display:'flex', gap:5, marginTop:'10px' }}><input placeholder="Question ?" value={commentText[event._id] || ''} onChange={e => setCommentText({...commentText, [event._id]: e.target.value})} style={{ margin:0, height:'35px' }} /><button onClick={() => handleComment(event._id)} style={{ width:'40px', padding:0, display:'flex', alignItems:'center', justifyContent:'center' }}><FaPaperPlane /></button></div>)}
                    </div>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}