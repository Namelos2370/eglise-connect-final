import Seo from '../components/Seo';
import { useState } from 'react'; // Import du Hook d'état
import { toast } from 'react-toastify';
import { FaPaypal, FaHandHoldingHeart, FaLock, FaCheckCircle, FaGlobe, FaMobileAlt, FaCopy, FaTimes } from 'react-icons/fa';

export default function DonationPage() {
  
  // ÉTAT POUR GÉRER L'OUVERTURE DE LA FENÊTRE MOMO
  const [showMomoModal, setShowMomoModal] = useState(false);

  // TON LIEN PAYPAL OFFICIEL
  const paypalLink = "https://www.paypal.com/donate/?hosted_button_id=QHD72DXYD5SH4";

  // LES NUMÉROS
  const numbers = {
      mtn: "653763393",
      orange: "658980051"
  };

  // FONCTION POUR COPIER LE NUMÉRO
  const handleCopy = (number) => {
      navigator.clipboard.writeText(number);
      toast.success(`Numéro ${number} copié !`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', paddingBottom:'80px' }}>
      <Seo title="Dons" path="/donations" />
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 20px rgba(223, 169, 46, 0.3)' }}>
            <FaHandHoldingHeart size={40} color="white" />
        </div>
        <h1 style={{ color: 'var(--secondary)', marginBottom: '10px' }}>Soutenir la Mission</h1>
        <p style={{ color: '#666', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
          Votre générosité nous permet de maintenir cette plateforme et de propager l'Évangile.
        </p>
      </div>

      {/* CARTE PRINCIPALE DE DON */}
      <div className="card" style={{ padding: '40px', textAlign: 'center', borderTop: '5px solid var(--primary)' }}>
        <h2 style={{ marginTop: 0, color: 'var(--secondary)' }}>Choisir votre méthode</h2>
        <p style={{ marginBottom: '30px', color: '#555' }}>
          Toutes les transactions sont sécurisées. Choisissez ce qui vous arrange le mieux.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto' }}>
            
            {/* BOUTON 1 : PAYPAL */}
            <a href={paypalLink} target="_blank" rel="noopener noreferrer" className="btn-magic" style={{ background: '#003087', textDecoration: 'none', justifyContent: 'center' }}>
              <FaPaypal style={{ marginRight: '10px', fontSize: '1.4rem' }} />
              Via PayPal / Carte Bancaire
            </a>

            {/* BOUTON 2 : MOBILE MONEY (OUVRE LA FENÊTRE) */}
            <button 
                onClick={() => setShowMomoModal(true)}
                className="btn-magic"
                style={{ background: '#10b981', justifyContent: 'center', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)' }}
            >
                <FaMobileAlt style={{ marginRight: '10px', fontSize: '1.4rem' }} />
                Via Mobile Money (OM / Momo)
            </button>
        </div>

        <div style={{ marginTop: '20px', fontSize: '0.85rem', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <FaLock size={12} /> Paiements sécurisés
        </div>
      </div>

      {/* RASSURANCE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>
          <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: 'var(--primary)' }}><FaGlobe /> Portée Mondiale</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Vos dons aident à connecter les croyants du monde entier via notre plateforme.</p>
          </div>
          <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', color: 'var(--primary)' }}><FaCheckCircle /> Transparence</h3>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>Chaque don est utilisé pour la maintenance technique et les œuvres sociales.</p>
          </div>
      </div>

      {/* ========================================================= */}
      {/* LA FENÊTRE INTUITIVE (MODAL) MOBILE MONEY                */}
      {/* ========================================================= */}
      {showMomoModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', zIndex: 9999,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '400px', padding: '30px', position: 'relative', animation: 'fadeIn 0.3s' }}>
                <button onClick={() => setShowMomoModal(false)} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', color: '#999', border: 'none', fontSize: '1.5rem', width:'auto' }}>
                    <FaTimes />
                </button>

                <h2 style={{ textAlign: 'center', marginTop: 0, color: 'var(--secondary)' }}>Transfert Mobile</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                    Effectuez un transfert direct vers l'un des numéros ci-dessous :
                </p>

                {/* ZONE MTN MOMO */}
                <div style={{ 
                    border: '2px solid #FFCC00', borderRadius: '15px', padding: '15px', marginBottom: '15px',
                    background: '#fffbf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <strong style={{ display: 'block', color: '#d97706', fontSize: '1.1rem' }}>MTN Momo</strong>
                        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>{numbers.mtn}</span>
                    </div>
                    <button onClick={() => handleCopy(numbers.mtn)} style={{ background: '#FFCC00', color: '#333', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}>
                        <FaCopy />
                    </button>
                </div>

                {/* ZONE ORANGE MONEY */}
                <div style={{ 
                    border: '2px solid #FF7900', borderRadius: '15px', padding: '15px', marginBottom: '25px',
                    background: '#fff5eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div>
                        <strong style={{ display: 'block', color: '#ea580c', fontSize: '1.1rem' }}>Orange Money</strong>
                        <span style={{ fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '1px' }}>{numbers.orange}</span>
                    </div>
                    <button onClick={() => handleCopy(numbers.orange)} style={{ background: '#FF7900', color: 'white', padding: '10px', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'none' }}>
                        <FaCopy />
                    </button>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.85rem', color: '#999' }}>
                    * Une fois le transfert effectué, vous recevrez la bénédiction de l'équipe ! 🙏
                </div>
            </div>
        </div>
      )}

    </div>
  );
}