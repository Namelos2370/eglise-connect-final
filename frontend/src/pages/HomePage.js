import { Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config'; // <--- IMPORT DE LA BONNE ADRESSE (Indispensable)
import { 
  FaCalendarAlt, FaComments, FaHandHoldingHeart, FaBible, 
  FaQuoteLeft, FaSignInAlt, FaUserPlus, FaBookOpen, FaPrayingHands,
  FaUsers, FaEnvelope, FaGlobeAfrica, FaChurch, FaHeart
} from 'react-icons/fa';

export default function HomePage() {
  const { user } = useContext(AuthContext);
  const [verse, setVerse] = useState(null);

  useEffect(() => {
    const versesList = [
      { text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique...", ref: "Jean 3:16" },
      { text: "L'Éternel est mon berger: je ne manquerai de rien.", ref: "Psaume 23:1" },
      { text: "Je puis tout par celui qui me fortifie.", ref: "Philippiens 4:13" },
      { text: "Car je connais les projets que j'ai formés sur vous...", ref: "Jérémie 29:11" },
      { text: "Recommande ton sort à l'Éternel, mets en lui ta confiance...", ref: "Psaume 37:5" },
      { text: "L'amour est patient, il est plein de bonté...", ref: "1 Corinthiens 13:4" },
      { text: "Ta parole est une lampe à mes pieds...", ref: "Psaume 119:105" }
    ];
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setVerse(versesList[dayOfYear % versesList.length]);
  }, []);

  return (
    <div>
      {/* BANNIÈRE HERO */}
      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary) 0%, #c6921e 100%)', 
        color: 'white', padding: '60px 20px', borderRadius: '0 0 50% 50% / 20px', 
        textAlign: 'center', marginBottom: '40px', boxShadow: '0 10px 25px -5px rgba(223, 169, 46, 0.4)'
      }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Église Connect</h1>
        <div style={{ fontSize: '1.3rem', opacity: 0.95, fontWeight:'500', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
          {user ? <><FaPrayingHands /> Paix à vous, {user.name}.</> : "Unissons nos cœurs, connectons nos âmes."}
        </div>
        {!user && (
          <div style={{ marginTop: '25px', display:'flex', justifyContent:'center', gap:'15px' }}>
            <Link to="/login"><button style={{ background: 'white', color: 'var(--primary)', display:'flex', alignItems:'center', gap:'8px' }}><FaSignInAlt /> Connexion</button></Link>
            <Link to="/signup"><button style={{ background: 'rgba(255,255,255,0.2)', border:'1px solid white', display:'flex', alignItems:'center', gap:'8px' }}><FaUserPlus /> Inscription</button></Link>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>

        {/* VERSET DU JOUR */}
        {verse && (
            <div style={{ textAlign: 'center', padding: '30px', background:'white', borderRadius:'15px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)', marginBottom:'50px', borderTop:'5px solid var(--primary)' }}>
                <FaQuoteLeft style={{ fontSize: '2rem', color: '#eee', marginBottom: '15px' }} />
                <p style={{ fontSize: '1.3rem', fontStyle: 'italic', color: '#444', margin: '0 0 20px 0', lineHeight: '1.6', fontFamily:'Georgia, serif' }}>"{verse.text}"</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight:'bold' }}>
                <FaBookOpen /> {verse.ref}
                </div>
            </div>
        )}

        {/* STATISTIQUES */}
        <div style={{ display:'flex', justifyContent:'space-around', flexWrap:'wrap', gap:'20px', marginBottom:'50px', textAlign:'center' }}>
            <div>
                <div style={{ fontSize:'2.5rem', color:'var(--primary)', fontWeight:'bold' }}>1,250+</div>
                <div style={{ color:'#666', display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}><FaUsers /> Membres Actifs</div>
            </div>
            <div>
                <div style={{ fontSize:'2.5rem', color:'var(--primary)', fontWeight:'bold' }}>540+</div>
                <div style={{ color:'#666', display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}><FaPrayingHands /> Prières Partagées</div>
            </div>
            <div>
                <div style={{ fontSize:'2.5rem', color:'var(--primary)', fontWeight:'bold' }}>12+</div>
                <div style={{ color:'#666', display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}><FaGlobeAfrica /> Pays Connectés</div>
            </div>
        </div>

        {/* GRILLE D'ACCÈS RAPIDE */}
        <h3 style={{ textAlign: 'center', color: 'var(--secondary)', marginBottom: '30px', textTransform:'uppercase', fontSize:'1rem', letterSpacing:'2px', borderBottom:'1px solid #eee', paddingBottom:'10px', display:'inline-block', width:'100%' }}>
            La Vie de la Communauté
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '60px' }}>
            <Link to="/events" style={linkStyle}>
                <div style={cardStyle}>
                    <div style={iconStyle}><FaCalendarAlt /></div>
                    <h3>Événements</h3>
                    <p style={descStyle}>Agenda des cultes et réunions.</p>
                </div>
            </Link>
            <Link to="/feed" style={linkStyle}>
                <div style={cardStyle}>
                    <div style={iconStyle}><FaBible /></div>
                    <h3>Fil d'Actualité</h3>
                    <p style={descStyle}>Partagez votre foi et témoignages.</p>
                </div>
            </Link>
            <Link to="/chat" style={linkStyle}>
                <div style={cardStyle}>
                    <div style={iconStyle}><FaComments /></div>
                    <h3>Groupe Global</h3>
                    <p style={descStyle}>Discussion ouverte à tous.</p>
                </div>
            </Link>
            <Link to="/donations" style={linkStyle}>
                <div style={cardStyle}>
                    <div style={iconStyle}><FaHandHoldingHeart /></div>
                    <h3>Faire un Don</h3>
                    <p style={descStyle}>Soutenez l'œuvre de l'église.</p>
                </div>
            </Link>
            <Link to="/members" style={linkStyle}>
                <div style={cardStyle}>
                    <div style={iconStyle}><FaUsers /></div>
                    <h3>Membres</h3>
                    <p style={descStyle}>Rencontrez la communauté.</p>
                </div>
            </Link>
            <Link to="/inbox" style={linkStyle}>
                <div style={cardStyle}>
                    <div style={iconStyle}><FaEnvelope /></div>
                    <h3>Messagerie</h3>
                    <p style={descStyle}>Vos échanges privés.</p>
                </div>
            </Link>
        </div>

        {/* POURQUOI NOUS ? */}
        <div style={{ background:'#f8f9fa', padding:'40px 20px', borderRadius:'20px', textAlign:'center', marginBottom:'40px' }}>
            <h2 style={{ color:'var(--secondary)', marginBottom:'30px' }}>Pourquoi rejoindre Église Connect ?</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'30px' }}>
                <div>
                    <div style={circleIconStyle}><FaChurch /></div>
                    <h4>Communion</h4>
                    <p style={{fontSize:'0.9em', color:'#666'}}>Restez lié à votre église où que vous soyez.</p>
                </div>
                <div>
                    <div style={circleIconStyle}><FaHeart /></div>
                    <h4>Entraide</h4>
                    <p style={{fontSize:'0.9em', color:'#666'}}>Soutenez-vous mutuellement par la prière.</p>
                </div>
                <div>
                    <div style={circleIconStyle}><FaGlobeAfrica /></div>
                    <h4>Évangélisation</h4>
                    <p style={{fontSize:'0.9em', color:'#666'}}>Un outil moderne pour partager la bonne nouvelle.</p>
                </div>
            </div>
        </div>

        {/* 6. SECTION NEWSLETTER CORRIGÉE */}
        <div style={{ background:'var(--secondary)', color:'white', padding:'40px 20px', borderRadius:'20px', textAlign:'center', marginTop:'60px', marginBottom:'40px' }}>
            <h2 style={{ color:'var(--primary)', marginBottom:'10px' }}>Restez informé</h2>
            <p style={{ opacity:0.8, marginBottom:'20px' }}>Inscrivez-vous à notre newsletter pour recevoir les nouvelles de la communauté.</p>
            
            <form 
                onSubmit={async (e) => {
                    e.preventDefault();
                    const email = e.target.elements.email.value;
                    try {
                        // UTILISATION DE API_URL ICI :
                        const res = await fetch(`${API_URL}/newsletter/subscribe`, {
                            method: 'POST', headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                        });
                        const data = await res.json();
                        if(res.ok) alert("Inscription réussie !"); 
                        else alert(data.message);
                    } catch(err) { alert("Erreur connexion serveur"); }
                }}
                style={{ display:'flex', maxWidth:'500px', margin:'0 auto', background:'white', padding:'5px', borderRadius:'30px' }}
            >
                <input name="email" type="email" placeholder="Votre adresse email..." style={{ flex:1, border:'none', background:'transparent', margin:0, padding:'10px 20px', borderRadius:'30px' }} required />
                <button type="submit" style={{ borderRadius:'25px', padding:'10px 25px', width:'auto', margin:0 }}>S'inscrire</button>
            </form>
        </div>

      </div>
    </div>
  );
}

const linkStyle = { textDecoration: 'none', color: 'inherit' };
const cardStyle = { background: 'white', padding: '30px 20px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer', height: '100%', boxSizing: 'border-box', border: '1px solid #f0f0f0' };
const iconStyle = { fontSize: '2.5rem', marginBottom: '15px', color: 'var(--primary)', background: '#fff8e1', width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' };
const descStyle = { color: '#888', fontSize:'0.9em', margin:0 };
const circleIconStyle = { background: 'white', color: 'var(--secondary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 15px auto', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' };