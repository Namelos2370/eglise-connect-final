import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaPrayingHands, FaPlus, FaLock, FaGlobe, FaUser } from 'react-icons/fa';
import API_URL from '../config'; // <--- IMPORT

export default function PrayerWallPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [prayers, setPrayers] = useState([]);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetchPrayers(); }, []);

  const fetchPrayers = async () => {
    try {
      const res = await fetch(`${API_URL}/prayers`);
      if (res.ok) setPrayers(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleAddPrayer = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/prayers`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content, isAnonymous })
      });
      if (res.ok) { toast.success("Requête ajoutée 🙏"); setContent(''); setShowForm(false); fetchPrayers(); }
    } catch (err) { toast.error("Erreur"); }
  };

  const handlePrayClick = async (prayerId) => {
    if (!user) { toast.info("Connectez-vous pour prier."); return navigate('/login'); }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/prayers/${prayerId}/pray`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { fetchPrayers(); toast.success("Merci pour votre soutien !"); }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '20px' }}>
      <div style={{ textAlign:'center', marginBottom:'30px' }}>
        <h2 style={{ color:'var(--secondary)', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}><FaPrayingHands style={{ color:'var(--primary)' }} /> Mur de Prières</h2>
        <p style={{ color:'#666' }}>Portez les fardeaux les uns des autres.</p>
        {user && (<button onClick={() => setShowForm(!showForm)} style={{ marginTop:'10px', borderRadius:'25px', display:'inline-flex', alignItems:'center', gap:5 }}><FaPlus /> Déposer une requête</button>)}
      </div>
      {showForm && (
        <div className="card" style={{ padding:'20px', marginBottom:'30px', borderTop:'3px solid var(--primary)' }}>
            <textarea placeholder="Sujet de prière..." value={content} onChange={e => setContent(e.target.value)} style={{ width:'100%', minHeight:'100px' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'10px' }}>
                <label style={{ display:'flex', alignItems:'center', gap:5, cursor:'pointer', fontSize:'0.9em' }}><input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} /> {isAnonymous ? <><FaLock /> Anonyme</> : <><FaGlobe /> Public</>}</label>
                <button onClick={handleAddPrayer} style={{ padding:'8px 20px' }}>Publier</button>
            </div>
        </div>
      )}
      <div style={{ display: 'grid', gap: '20px' }}>
        {prayers.map(prayer => {
            const hasPrayed = user && prayer.prayedBy.includes(user._id);
            return (
                <div key={prayer._id} className="card" style={{ padding:'20px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                        <strong style={{ color: prayer.isAnonymous ? '#888' : 'var(--primary)', display:'flex', alignItems:'center', gap:5 }}>{prayer.isAnonymous ? <FaLock size={12}/> : <FaUser size={12}/>} {prayer.isAnonymous ? "Un membre" : prayer.author?.name}</strong>
                        <small style={{ color:'#aaa' }}>{new Date(prayer.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p style={{ fontSize:'1.1em', color:'#333', fontStyle:'italic', margin:'0 0 15px 0', lineHeight:'1.6' }}>"{prayer.content}"</p>
                    <div style={{ borderTop:'1px solid #eee', paddingTop:'10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ fontSize:'0.9em', color:'#666' }}><strong>{prayer.prayedBy.length}</strong> intercesseurs.</div>
                        <button onClick={() => handlePrayClick(prayer._id)} style={{ background: hasPrayed ? '#dcfce7' : 'white', color: hasPrayed ? '#166534' : '#666', border: '1px solid #ddd', display:'flex', alignItems:'center', gap:5, boxShadow:'none' }}><FaPrayingHands /> {hasPrayed ? "J'ai prié" : "Je prie"}</button>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
}