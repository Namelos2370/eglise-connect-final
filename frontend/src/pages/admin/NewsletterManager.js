import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaTrash, FaPaperPlane, FaPlus, FaEnvelopeOpenText, FaPaste, FaUsers, FaSpinner } from 'react-icons/fa';

export default function NewsletterManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'import', 'send'
  
  // États Import
  const [importText, setImportText] = useState('');
  
  // États Envoi
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3002/admin/newsletter', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setSubscribers(await res.json());
    } catch (err) { console.error(err); }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3002/admin/newsletter/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ textList: importText })
        });
        const data = await res.json();
        if (res.ok) {
            toast.success(data.message);
            setImportText('');
            fetchSubscribers();
            setActiveTab('list');
        } else { toast.error(data.error); }
    } catch (err) { toast.error("Erreur import"); }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    if(!window.confirm(`Envoyer cet email à ${subscribers.length} personnes ?`)) return;

    setSending(true);
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('http://localhost:3002/admin/newsletter/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ subject: emailSubject, message: emailBody })
        });
        const data = await res.json();
        if (res.ok) {
            toast.success(data.message);
            setEmailSubject('');
            setEmailBody('');
        } else { toast.error(data.error); }
    } catch (err) { toast.error("Erreur envoi"); }
    setSending(false);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Retirer cet email ?")) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`http://localhost:3002/admin/newsletter/${id}`, {
            method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) { toast.success("Supprimé"); fetchSubscribers(); }
    } catch (err) { toast.error("Erreur"); }
  };

  return (
    <div>
        <h2 style={{ borderBottom:'2px solid var(--primary)', paddingBottom:10, color:'var(--secondary)' }}>Gestion Newsletter</h2>

        {/* ONGLETS */}
        <div style={{ display:'flex', gap:10, margin:'20px 0' }}>
            <button onClick={() => setActiveTab('list')} style={{ background: activeTab==='list'?'var(--primary)':'white', color: activeTab==='list'?'white':'#666', border: '1px solid #eee', display:'flex', alignItems:'center', gap:8 }}>
                <FaUsers /> Liste ({subscribers.length})
            </button>
            <button onClick={() => setActiveTab('import')} style={{ background: activeTab==='import'?'var(--primary)':'white', color: activeTab==='import'?'white':'#666', border: '1px solid #eee', display:'flex', alignItems:'center', gap:8 }}>
                <FaPaste /> Import de masse
            </button>
            <button onClick={() => setActiveTab('send')} style={{ background: activeTab==='send'?'var(--primary)':'white', color: activeTab==='send'?'white':'#666', border: '1px solid #eee', display:'flex', alignItems:'center', gap:8 }}>
                <FaPaperPlane /> Diffuser
            </button>
        </div>

        {/* 1. ONGLET LISTE */}
        {activeTab === 'list' && (
            <div className="card" style={{ padding:0, overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                        <tr style={{ background:'#f9fafb', textAlign:'left' }}>
                            <th style={{ padding:15 }}>Email</th>
                            <th style={{ padding:15 }}>Date</th>
                            <th style={{ padding:15, textAlign:'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.map(sub => (
                            <tr key={sub._id} style={{ borderBottom:'1px solid #f0f0f0' }}>
                                <td style={{ padding:15, fontWeight:'bold', color:'#333' }}>{sub.email}</td>
                                <td style={{ padding:15, color:'#666' }}>{new Date(sub.date).toLocaleDateString()}</td>
                                <td style={{ padding:15, textAlign:'right' }}>
                                    <button onClick={() => handleDelete(sub._id)} style={{ background:'#fee2e2', color:'#dc2626', padding:'5px 10px', fontSize:'0.8em', width:'auto' }}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subscribers.length === 0 && <p style={{textAlign:'center', padding:30, color:'#999'}}>Aucun abonné.</p>}
            </div>
        )}

        {/* 2. ONGLET IMPORT DE MASSE */}
        {activeTab === 'import' && (
            <div className="card" style={{ padding:'30px' }}>
                <h3><FaPaste style={{color:'var(--primary)'}}/> Collez vos emails ici</h3>
                <p style={{color:'#666', fontSize:'0.9em'}}>Vous pouvez coller une longue liste brute. Les séparateurs acceptés sont : virgule, point-virgule, espace, retour à la ligne.</p>
                
                <form onSubmit={handleImport}>
                    <textarea 
                        value={importText}
                        onChange={e => setImportText(e.target.value)}
                        placeholder="Exemple : jean@gmail.com, marie@yahoo.fr \n paul@orange.fr"
                        style={{ width:'100%', minHeight:'200px', padding:'15px', fontSize:'1rem' }}
                    />
                    <button type="submit" style={{ marginTop:'15px', width:'100%' }}>Lancer l'importation</button>
                </form>
            </div>
        )}

        {/* 3. ONGLET ENVOI (DIFFUSION) */}
        {activeTab === 'send' && (
            <div className="card" style={{ padding:'30px', borderTop:'5px solid var(--primary)' }}>
                <h3><FaEnvelopeOpenText /> Envoyer une Newsletter</h3>
                <div style={{ background:'#f0fdf4', padding:'10px', borderRadius:'5px', color:'#166534', marginBottom:'20px', fontSize:'0.9em', fontWeight:'bold' }}>
                    Cet email sera envoyé à {subscribers.length} destinataires en copie cachée (BCC).
                </div>

                <form onSubmit={handleSendNewsletter}>
                    <label style={{fontWeight:'bold'}}>Sujet de l'email</label>
                    <input 
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        placeholder="Ex: Les nouvelles de la semaine..."
                        required
                    />

                    <label style={{fontWeight:'bold', marginTop:'15px', display:'block'}}>Message</label>
                    <textarea 
                        value={emailBody}
                        onChange={e => setEmailBody(e.target.value)}
                        placeholder="Bonjour à tous..."
                        style={{ width:'100%', minHeight:'250px', padding:'15px' }}
                        required
                    />

                    <button type="submit" disabled={sending} style={{ marginTop:'20px', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity: sending ? 0.7 : 1 }}>
                        {sending ? <><FaSpinner className="fa-spin" /> Envoi en cours...</> : <><FaPaperPlane /> Envoyer à tous</>}
                    </button>
                </form>
            </div>
        )}
    </div>
  );
}