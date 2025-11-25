import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTrash, FaBug, FaLightbulb, FaHeart, FaQuestionCircle } from 'react-icons/fa';

export default function FeedbackManager() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3002/feedback/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setFeedbacks(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Supprimer ce feedback ?")) return;
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:3002/feedback/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
    toast.success("Supprimé"); fetchFeedbacks();
  };

  const getIcon = (type) => {
      if(type === 'Bug') return <FaBug color="#dc2626" />;
      if(type === 'Suggestion') return <FaLightbulb color="#eab308" />;
      if(type === 'Appréciation') return <FaHeart color="#e11d48" />;
      return <FaQuestionCircle color="#666" />;
  };

  return (
    <div>
        <h2 style={{ borderBottom:'2px solid var(--primary)', paddingBottom:10 }}>Retours Utilisateurs</h2>
        <div className="card" style={{ padding:0, overflow:'hidden', marginTop:20 }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                    <tr style={{ background:'#f9f9f9', textAlign:'left' }}>
                        <th style={{ padding:15 }}>Type</th>
                        <th style={{ padding:15 }}>Auteur</th>
                        <th style={{ padding:15 }}>Message</th>
                        <th style={{ padding:15 }}>Date</th>
                        <th style={{ padding:15 }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {feedbacks.map(fb => (
                        <tr key={fb._id} style={{ borderBottom:'1px solid #eee' }}>
                            <td style={{ padding:15 }}>{getIcon(fb.type)} <strong>{fb.type}</strong></td>
                            <td style={{ padding:15 }}>
                                {fb.user ? (
                                    <div><strong>{fb.user.name}</strong><br/><small>{fb.user.email}</small></div>
                                ) : ( <span style={{fontStyle:'italic', color:'#666'}}>{fb.guestEmail || 'Anonyme'}</span> )}
                            </td>
                            <td style={{ padding:15, maxWidth:'300px' }}>"{fb.message}"</td>
                            <td style={{ padding:15, fontSize:'0.9em', color:'#888' }}>{new Date(fb.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding:15 }}>
                                <button onClick={() => handleDelete(fb._id)} style={{ background:'#fee2e2', color:'#dc2626', padding:'5px 10px', fontSize:'0.8em' }}><FaTrash /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {feedbacks.length === 0 && <p style={{textAlign:'center', padding:30, color:'#999'}}>Aucun retour pour le moment.</p>}
        </div>
    </div>
  );
}