import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaShieldAlt, FaUser, FaChevronDown, FaEnvelope } from 'react-icons/fa';

export default function MembersPage() {
  const { user } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Limite d'affichage initiale (6 = 2 lignes de 3 sur PC)
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchMembers = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await fetch('http://localhost:3002/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setMembers(await res.json());
      } catch (err) { toast.error("Erreur chargement"); }
      setLoading(false);
    };
    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => {
    if (member._id === user._id) return false;
    const name = member.name ? member.name.toLowerCase() : "";
    const city = member.city ? member.city.toLowerCase() : "";
    const search = searchTerm.toLowerCase();
    return name.includes(search) || city.includes(search);
  });

  const visibleMembers = filteredMembers.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px' }}>
      
      {/* --- EN-TÊTE AVEC RECHERCHE CENTRÉE --- */}
      <div style={{ textAlign:'center', marginBottom:'50px' }}>
        <h2 style={{ color:'var(--secondary)', fontSize:'2rem', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'2px' }}>
            La Communauté
        </h2>
        <div style={{ width:'60px', height:'4px', background:'var(--primary)', margin:'0 auto 30px auto' }}></div>

        <div style={{ position: 'relative', maxWidth:'500px', margin:'0 auto' }}>
            <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform:'translateY(-50%)', color: 'var(--primary)' }} />
            <input 
                type="text" 
                placeholder="Rechercher un frère, une sœur..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                    width:'100%', padding:'15px 15px 15px 50px', borderRadius:'50px', border:'1px solid #eee', 
                    boxShadow:'0 5px 20px rgba(0,0,0,0.05)', fontSize:'1rem', outline:'none'
                }}
            />
        </div>
      </div>

      {/* --- GRILLE PARFAITE (3 Colonnes) --- */}
      {loading ? (
          <p style={{textAlign:'center', color:'#888'}}>Chargement...</p>
      ) : filteredMembers.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px', color:'#999' }}>
            <p>Aucun membre trouvé.</p>
        </div>
      ) : (
        <>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: '30px' 
            }}>
                {visibleMembers.map(member => (
                    <Link to={`/user/${member._id}`} key={member._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="member-card-pro">
                            
                            {/* BANDEAU HAUT (Or) */}
                            <div className="card-top-bar"></div>

                            {/* AVATAR */}
                            <div className="avatar-box">
                                {member.photo ? (
                                    <>
                                        <img src={member.photo} alt={member.name} onError={handleImageError} className="real-avatar" />
                                        <div className="fallback-avatar"><FaUser /></div>
                                    </>
                                ) : (
                                    <div className="fallback-avatar"><FaUser /></div>
                                )}
                                {member.role === 'admin' && <div className="badge-admin" title="Admin"><FaShieldAlt /></div>}
                            </div>

                            {/* INFO */}
                            <div className="card-body">
                                <h3 className="member-name">{member.name}</h3>
                                <p className="member-location">
                                    {member.city ? <><FaMapMarkerAlt /> {member.city}</> : "Membre Fidèle"}
                                </p>
                            </div>

                            {/* FOOTER CARTE */}
                            <div className="card-footer">
                                <span className="view-profile">Voir le profil</span>
                                <span className="icon-action"><FaEnvelope /></span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* --- BOUTON VOIR PLUS --- */}
            {visibleCount < filteredMembers.length && (
                <div style={{ textAlign:'center', marginTop:'50px' }}>
                    <button 
                        onClick={handleLoadMore}
                        style={{ 
                            background:'transparent', border:'2px solid var(--primary)', color:'var(--primary)', 
                            padding:'12px 40px', borderRadius:'30px', fontWeight:'bold', fontSize:'1rem',
                            display:'inline-flex', alignItems:'center', gap:10, cursor:'pointer',
                            transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {e.currentTarget.style.background='var(--primary)'; e.currentTarget.style.color='white'}}
                        onMouseLeave={(e) => {e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--primary)'}}
                    >
                        <FaChevronDown /> Voir les autres membres ({filteredMembers.length - visibleCount})
                    </button>
                </div>
            )}
        </>
      )}
      
      {/* STYLES LOCAUX POUR CETTE PAGE (DESIGN UNIQUE) */}
      <style>{`
        .member-card-pro {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.05);
            position: relative;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid #f0f0f0;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            height: 100%;
        }
        .member-card-pro:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(223, 169, 46, 0.15);
            border-color: var(--primary);
        }
        .card-top-bar {
            height: 80px;
            width: 100%;
            background: linear-gradient(135deg, #333 0%, #555 100%); /* Gris foncé Eglise Connect */
            position: absolute;
            top: 0; left: 0;
        }
        .avatar-box {
            width: 100px; height: 100px;
            margin-top: 30px;
            position: relative;
            z-index: 1;
        }
        .real-avatar {
            width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
            border: 4px solid white;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .fallback-avatar {
            width: 100%; height: 100%; border-radius: 50%; background: #f0f0f0;
            display: flex; align-items: center; justifyContent: center;
            color: #ccc; font-size: 40px; border: 4px solid white;
        }
        .badge-admin {
            position: absolute; bottom: 0; right: 0;
            background: var(--primary); color: white;
            width: 30px; height: 30px; border-radius: 50%;
            display: flex; align-items: center; justifyContent: center;
            border: 2px solid white; font-size: 0.8rem;
        }
        .card-body {
            padding: 15px 20px;
            flex: 1;
        }
        .member-name {
            margin: 10px 0 5px 0;
            color: var(--secondary);
            font-size: 1.2rem;
            font-weight: 700;
        }
        .member-location {
            color: #888;
            font-size: 0.9rem;
            display: flex; alignItems: center; justifyContent: center; gap: 5px;
        }
        .card-footer {
            width: 100%;
            border-top: 1px solid #f5f5f5;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: var(--primary);
            font-weight: 600;
            font-size: 0.9rem;
            background: #fafafa;
        }
        .icon-action {
            background: white;
            width: 35px; height: 35px;
            border-radius: 50%;
            display: flex; align-items: center; justifyContent: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
            color: #333;
            transition: all 0.2s;
        }
        .member-card-pro:hover .icon-action {
            background: var(--primary); color: white;
        }
      `}</style>
    </div>
  );
}