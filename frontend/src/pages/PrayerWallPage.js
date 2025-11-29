import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaPrayingHands, FaPlus, FaLock, FaGlobe, FaUser, FaHeart } from 'react-icons/fa';
import API_URL from '../config';

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
      if (res.ok) { toast.success("Requête déposée 🙏"); setContent(''); setShowForm(false); fetchPrayers(); }
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', paddingBottom:'80px' }}>
      
      <div style={{ textAlign:'center', marginBottom:'40px', background:'linear-gradient(135deg, #fff8e1 0%, #fff 100%)', padding:'40px', borderRadius:'20px', boxShadow:'0 5px 20px rgba(0,0,0,0.05)' }}>
        <FaPrayingHands style={{ fontSize:'3rem', color:'var(--primary)', marginBottom:'15px' }} />
        <h2 style={{ margin:0, color:'var(--secondary)', fontSize:'2rem' }}>Mur de Prières</h2>
        <p style={{ color:'#666', fontSize:'1.1rem' }}>"Portez les fardeaux les uns des autres..." (Galates 6:2)</p>
        <div style={{ marginTop:'15px', fontSize:'0.9em', color:'var(--primary)', fontWeight:'bold' }}>
            {prayers.length} requêtes en cours
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ padding:'25px', marginBottom:'30px', borderTop:'4px solid var(--primary)', animation:'fadeIn 0.3s' }}>
            <h3 style={{marginTop:0}}>Ma requête</h3>
            <textarea placeholder="Sujet de prière..." value={content} onChange={e => setContent(e.target.value)} style={{ width:'100%', minHeight:'120px', padding:'15px', fontSize:'1.1rem', border:'1px solid #ddd', borderRadius:'10px' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'15px' }}>
                <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', color:'#555' }}>
                    <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} style={{width:18, height:18}} /> 
                    {isAnonymous ? <><FaLock /> Anonyme</> : <><FaGlobe /> Public</>}
                </label>
                <button onClick={handleAddPrayer} style={{ padding:'10px 30px', borderRadius:'25px' }}>Publier</button>
            </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px' }}>
        {prayers.map(prayer => {
            const hasPrayed = user && prayer.prayedBy.includes(user._id);
            return (
                <div key={prayer._id} className="card" style={{ padding:'25px', position:'relative', borderLeft: hasPrayed ? '5px solid #10b981' : '5px solid #eee' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'15px', alignItems:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:40, height:40, borderRadius:'50%', background: prayer.isAnonymous ? '#eee' : 'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}>
                                {prayer.isAnonymous ? <FaLock /> : (prayer.author?.photo ? <img src={prayer.author.photo} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} alt=""/> : <FaUser />)}
                            </div>
                            <div>
                                <strong style={{ display:'block', color: '#333' }}>{prayer.isAnonymous ? "Un membre" : prayer.author?.name}</strong>
                                <small style={{ color:'#aaa' }}>{new Date(prayer.createdAt).toLocaleDateString('fr-FR', {day:'numeric', month:'long'})}</small>
                            </div>
                        </div>
                    </div>
                    
                    <p style={{ fontSize:'1.2rem', color:'#444', fontStyle:'italic', margin:'0 0 20px 0', lineHeight:'1.6' }}>
                        "{prayer.content}"
                    </p>
                    
                    <div style={{ borderTop:'1px solid #f5f5f5', paddingTop:'15px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div style={{ fontSize:'0.9em', color: hasPrayed ? '#10b981' : '#666', display:'flex', alignItems:'center', gap:5 }}>
                            <FaHeart /> <strong>{prayer.prayedBy.length}</strong> prières
                        </div>
                        <button 
                            onClick={() => handlePrayClick(prayer._id)}
                            style={{ 
                                background: hasPrayed ? '#dcfce7' : 'white', 
                                color: hasPrayed ? '#166534' : 'var(--primary)', 
                                border: hasPrayed ? 'none' : '1px solid var(--primary)',
                                display:'flex', alignItems:'center', gap:8, boxShadow:'none',
                                padding:'8px 20px', borderRadius:'20px', fontWeight:'bold'
                            }}
                        >
                            <FaPrayingHands /> {hasPrayed ? "J'ai prié" : "Je prie"}
                        </button>
                    </div>
                </div>
            );
        })}
      </div>

      {/* BOUTON FLOTTANT (FAB) pour mobile et desktop */}
      {user && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            style={{
                position:'fixed', bottom:'90px', right:'20px',
                width:'60px', height:'60px', borderRadius:'50%',
                background:'var(--primary)', color:'white', border:'none',
                boxShadow:'0 5px 20px rgba(223, 169, 46, 0.4)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.5rem', zIndex:1000, cursor:'pointer'
            }}
            title="Ajouter une prière"
          >
              <FaPlus />
          </button>
      )}
    </div>
  );
}