import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCommentDots, FaBug, FaLightbulb, FaHeart, FaPaperPlane } from 'react-icons/fa';

export default function FeedbackPage() {
  const { user } = useContext(AuthContext);
  
  const [type, setType] = useState('Suggestion');
  const [message, setMessage] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if(token) headers['Authorization'] = `Bearer ${token}`;

    try {
        const res = await fetch('http://localhost:3002/feedback', {
            method: 'POST', headers, 
            body: JSON.stringify({ type, message, guestEmail: user ? undefined : guestEmail })
        });
        if (res.ok) {
            toast.success("Merci ! Votre avis compte beaucoup. 🌟");
            setMessage(''); setGuestEmail('');
        } else {
            toast.error("Erreur lors de l'envoi.");
        }
    } catch (err) { toast.error("Erreur serveur"); }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
        <div className="card" style={{ padding:'40px', textAlign:'center' }}>
            <h2 style={{ color:'var(--secondary)', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <FaCommentDots style={{ color:'var(--primary)' }} /> Votre Avis
            </h2>
            <p style={{ color:'#666', marginBottom:'30px' }}>
                Aidez-nous à améliorer <strong>Église Connect</strong>. Signalez un bug ou proposez une idée !
            </p>

            <form onSubmit={handleSubmit} style={{ textAlign:'left' }}>
                
                <label style={{fontWeight:'bold', color:'#555'}}>Type de retour</label>
                <div style={{ display:'flex', gap:10, marginBottom:'20px', marginTop:'5px' }}>
                    {['Suggestion', 'Bug', 'Appréciation'].map(t => (
                        <button 
                            key={t} type="button" onClick={() => setType(t)}
                            style={{ 
                                flex:1, background: type===t ? 'var(--primary)' : '#f0f0f0', 
                                color: type===t ? 'white' : '#555', border:'none', fontSize:'0.8em' 
                            }}
                        >
                            {t === 'Bug' && <FaBug />} {t === 'Suggestion' && <FaLightbulb />} {t === 'Appréciation' && <FaHeart />} {t}
                        </button>
                    ))}
                </div>

                {!user && (
                    <div style={{ marginBottom:'15px' }}>
                        <label style={{fontWeight:'bold', color:'#555'}}>Votre Email (Optionnel)</label>
                        <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="Pour vous répondre..." />
                    </div>
                )}

                <label style={{fontWeight:'bold', color:'#555'}}>Message</label>
                <textarea 
                    value={message} onChange={e => setMessage(e.target.value)} 
                    placeholder="Dites-nous tout..." required
                    style={{ minHeight:'150px' }}
                />

                <button type="submit" style={{ width:'100%', marginTop:'10px', display:'flex', justifyContent:'center', alignItems:'center', gap:8 }}>
                    <FaPaperPlane /> Envoyer
                </button>
            </form>
        </div>
    </div>
  );
}