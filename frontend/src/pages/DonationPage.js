import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaHandHoldingHeart, FaCreditCard, FaLaptopCode, FaServer, FaCheckCircle, FaLock, FaUser, FaEnvelope, FaMobileAlt, FaCode, FaRocket } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import API_URL from '../config'; // <--- IMPORT

const stripePromise = loadStripe('pk_test_TY_PUBLIC_KEY_ICI'); 

const CheckoutForm = ({ amount, guestInfo, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    try {
        const res = await fetch(`${API_URL}/donations/create-payment-intent`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: parseInt(amount) })
        });
        const { clientSecret } = await res.json();
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: elements.getElement(CardElement), billing_details: { name: guestInfo.name } },
        });
        if (result.error) { toast.error(result.error.message); setProcessing(false); } 
        else if (result.paymentIntent.status === 'succeeded') { onSuccess('Carte Bancaire'); setProcessing(false); }
    } catch(e) { toast.error("Erreur paiement"); setProcessing(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ padding:'15px', border:'1px solid #ccc', borderRadius:'5px', background:'white', marginBottom:'20px' }}><CardElement options={{ style: { base: { fontSize: '16px' } } }} /></div>
      <button type="submit" disabled={!stripe || processing} style={{ width: '100%', padding: '15px', borderRadius: '10px', opacity: processing ? 0.5 : 1, background:'#333', color:'white', border:'none', fontWeight:'bold' }}>{processing ? "Traitement..." : `Payer ${amount} XAF`}</button>
    </form>
  );
};

export default function DonationPage() {
  const { user } = useContext(AuthContext);
  const [amount, setAmount] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMode, setPaymentMode] = useState(null); 
  const [loading, setLoading] = useState(false);

  const handlePaymentSuccess = async (method) => {
    const token = localStorage.getItem('token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const bodyData = { amount, type: 'Soutien Technique', guestName, guestEmail, paymentMethod: method };
    try {
        await fetch(`${API_URL}/donations`, { method: 'POST', headers, body: JSON.stringify(bodyData) });
        toast.success('Paiement réussi ! Merci ! 🚀');
        setAmount(''); setPaymentMode(null);
    } catch(e) { toast.error("Erreur sauvegarde"); }
  };

  const handleMobilePayment = async () => {
    if(!amount) return toast.warning("Veuillez entrer un montant.");
    setLoading(true);
    try {
        toast.info("Connexion à Campay...");
        const res = await fetch(`${API_URL}/donations/mobile-payment`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount, email: user ? user.email : guestEmail })
        });
        const data = await res.json();
        if(data.payment_url) window.location.href = data.payment_url; 
        else toast.error(data.error || "Erreur Campay");
    } catch(e) { toast.error("Erreur serveur"); }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)', color: 'white', padding: '40px 30px', borderRadius: '20px', marginBottom: '30px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', width:'80px', height:'80px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px auto' }}><FaRocket style={{ fontSize: '3rem', color: 'var(--primary)' }} /></div>
        <h1 style={{ color: 'white', margin: '10px 0', fontSize: '2rem' }}>Soutenez l'Innovation</h1>
        <p style={{ opacity: 0.9, lineHeight: '1.8', maxWidth: '650px', margin: '0 auto 30px auto', fontSize: '1.1rem' }}>Votre contribution finance directement les serveurs et le développement.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.9em', background:'rgba(255,255,255,0.1)', padding:'8px 20px', borderRadius:'25px' }}><FaServer style={{ color: 'var(--primary)' }} /> Serveurs</div>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.9em', background:'rgba(255,255,255,0.1)', padding:'8px 20px', borderRadius:'25px' }}><FaCode style={{ color: 'var(--primary)' }} /> Dév</div>
        </div>
      </div>

      <div className="card" style={{ padding: '40px', borderTop: '5px solid var(--primary)' }}>
        {!paymentMode ? (
            <>
                <h2 style={{ textAlign: 'center', marginBottom:'30px', color:'#333' }}>Je fais un don 🎁</h2>
                <div style={{ marginBottom:'25px' }}><label style={{ fontWeight: 'bold', color: '#555', display: 'block', marginBottom: '10px' }}>Montant (XAF) :</label><div style={{ position: 'relative' }}><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ex: 1000" style={{ paddingLeft: '50px', fontSize: '1.3em', height: '55px', fontWeight:'bold', color:'var(--primary)' }} /><FaHandHoldingHeart style={{ position: 'absolute', left: '15px', top: '18px', fontSize: '1.5em', color: '#ccc' }} /></div></div>
                {!user && (<div style={{ marginBottom:'25px', padding:'20px', background:'#fffbf0', borderRadius:'10px', border:'1px dashed #DFA92E' }}><h4 style={{margin:'0 0 15px 0', color:'#DFA92E', fontSize:'0.9em', textTransform:'uppercase'}}>Vos informations</h4><div style={{ display:'grid', gap:'15px' }}><div style={{ position: 'relative' }}><FaUser style={{ position: 'absolute', left: '12px', top: '15px', color: '#aaa' }} /><input placeholder="Nom" value={guestName} onChange={e => setGuestName(e.target.value)} style={{ paddingLeft:'35px' }} /></div><div style={{ position: 'relative' }}><FaEnvelope style={{ position: 'absolute', left: '12px', top: '15px', color: '#aaa' }} /><input type="email" placeholder="Email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} style={{ paddingLeft:'35px' }} /></div></div></div>)}
                <div style={{ display:'flex', gap:15, flexDirection:'column' }}>
                    <button onClick={() => { if(amount) handleMobilePayment(); else toast.warning("Indiquez un montant"); }} disabled={loading} style={{ width:'100%', background: loading ? '#ccc' : '#FF6600', border:'none', display:'flex', justifyContent:'center', alignItems:'center', gap:10, padding:'15px', borderRadius:'10px', fontSize:'1.1em', boxShadow:'0 4px 10px rgba(255,102,0,0.2)' }}>{loading ? "Chargement..." : <><FaMobileAlt size={22} /> Orange Money / MTN</>}</button>
                    <button onClick={() => { if(amount) setPaymentMode('card'); else toast.warning("Indiquez un montant"); }} style={{ width:'100%', background:'white', color:'#333', border:'2px solid #eee', display:'flex', justifyContent:'center', alignItems:'center', gap:10, padding:'15px', borderRadius:'10px', fontSize:'1.1em' }}><FaCreditCard size={20} /> Carte Bancaire</button>
                </div>
            </>
        ) : (
            <Elements stripe={stripePromise}>
                <h3 style={{ textAlign:'center', marginBottom:'20px' }}>🔒 Carte Bancaire</h3>
                <div style={{textAlign:'center', marginBottom:'20px', fontSize:'1.2em', fontWeight:'bold', color:'var(--primary)'}}>{amount} XAF</div>
                <CheckoutForm amount={amount} guestInfo={{name: guestName}} onSuccess={() => handlePaymentSuccess('Carte Bancaire')} />
                <button onClick={() => setPaymentMode(null)} style={{ background:'transparent', color:'#666', width:'100%', marginTop:'10px', border:'none', textDecoration:'underline' }}>Changer de méthode</button>
            </Elements>
        )}
      </div>
    </div>
  );
}