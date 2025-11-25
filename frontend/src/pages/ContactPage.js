import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaEnvelope, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

export default function ContactPage() {
  // Pour le MVP, le formulaire ne fait que simuler l'envoi ou ouvrir le client mail
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulation d'envoi
    toast.success("Votre message a été envoyé à l'équipe !");
    setFormData({ name: '', email: '', message: '' });
    
    // Optionnel : Ouvrir le client mail réel
    // window.location.href = `mailto:bureauegliseconnect@gmail.com?subject=Contact de ${formData.name}&body=${formData.message}`;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px', display:'flex', flexWrap:'wrap', gap:'40px' }}>
      
      {/* INFO CONTACT */}
      <div style={{ flex:1, minWidth:'300px' }}>
        <h1 style={{ color:'var(--secondary)' }}>Contactez-nous</h1>
        <p style={{ color:'#666', marginBottom:'30px' }}>
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
                <div style={{ background:'var(--primary)', color:'white', width:'50px', height:'50px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}><FaPhone /></div>
                <div>
                    <div style={{ fontWeight:'bold' }}>Téléphone</div>
                    <span style={{ color:'#666' }}>+237 6XX XX XX XX</span>
                </div>
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'15px' }}>
                <div style={{ background:'var(--primary)', color:'white', width:'50px', height:'50px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}><FaMapMarkerAlt /></div>
                <div>
                    <div style={{ fontWeight:'bold' }}>Adresse</div>
                    <span style={{ color:'#666' }}>Siège Église Connect, Cameroun</span>
                </div>
            </div>
        </div>
      </div>

      {/* FORMULAIRE */}
      <div className="card" style={{ flex:1, minWidth:'300px', padding:'30px' }}>
        <h3 style={{ marginTop:0 }}>Envoyez un message</h3>
        <form onSubmit={handleSubmit}>
            <label>Nom complet</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            
            <label>Email</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            
            <label>Message</label>
            <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ minHeight:'150px' }} required />
            
            <button type="submit" style={{ width:'100%', marginTop:'10px' }}>Envoyer</button>
        </form>
      </div>

    </div>
  );
}