import { useState } from 'react';
import { toast } from 'react-toastify';
import Seo from '../components/Seo';
import API_URL from '../config';
import { useAntiSpam } from '../utils/antispam';
import { FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa'; 

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const { looksLikeBot, Honeypot } = useAntiSpam();
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, message } = formData;
    if (name.trim().length < 2) return toast.error("Veuillez saisir votre nom.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast.error("Adresse email invalide.");
    if (message.trim().length < 10) return toast.error("Votre message est trop court (10 caractères min).");
    if (looksLikeBot()) { toast.success("Message envoyé !"); return; }
    setSending(true);
    try {
      const res = await fetch(`${API_URL}/feedback`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'Autre', message: `[Contact] ${name.trim()} : ${message.trim()}`, guestEmail: email.trim() })
      });
      if (!res.ok) throw new Error();
      toast.success("Votre message a bien été envoyé à l'équipe !");
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error("Envoi impossible. Écrivez-nous à bureauegliseconnect@gmail.com");
    } finally { setSending(false); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', display:'flex', flexWrap:'wrap', gap:'40px' }}>
      
      <Seo title="Contact" description="Contactez l'équipe d'Église Connect : question, suggestion ou demande de prière." path="/contact" />
      <div style={{ flex:1, minWidth:'300px' }}>
        <h1 style={{ color:'var(--secondary)' }}>Contactez-nous</h1>
        <p style={{ color:'var(--text-light)', marginBottom:'30px' }}>
            Une question, une suggestion ou un besoin de prière ? Notre équipe est à votre écoute.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                <div style={{ background:'var(--primary)', color:'white', width:'50px', height:'50px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}><FaEnvelope /></div>
                <div>
                    <div style={{ fontWeight:'bold' }}>Email</div>
                    <a href="mailto:bureauegliseconnect@gmail.com" style={{ color:'var(--primary)', textDecoration:'none' }}>bureauegliseconnect@gmail.com</a>
                </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                <div style={{ background:'var(--primary)', color:'white', width:'50px', height:'50px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}><FaMapMarkerAlt /></div>
                <div>
                    <div style={{ fontWeight:'bold' }}>Adresse</div>
                    <span style={{ color:'var(--text-light)' }}>Siège Église Connect, Cameroun</span>
                </div>
            </div>
        </div>
      </div>

      <div className="card" style={{ flex:1, minWidth:'300px', padding:'30px' }}>
        <h3 style={{ marginTop:0 }}>Envoyez un message</h3>
        <form onSubmit={handleSubmit} noValidate>
            <Honeypot />
            <label>Nom complet</label>
            <input autoComplete="name" maxLength={80} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            
            <label>Email</label>
            <input type="email" autoComplete="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            
            <label>Message</label>
            <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ minHeight:'150px' }} required />
            
            <button type="submit" disabled={sending} style={{ width:'100%', marginTop:'10px' }}>{sending ? 'Envoi…' : 'Envoyer'}</button>
        </form>
      </div>

    </div>
  );
}