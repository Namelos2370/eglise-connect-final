import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { FaNewspaper, FaUserCircle, FaEnvelope, FaChurch, FaEllipsisH, FaStore, FaUsers,
  FaCalendarAlt, FaPrayingHands, FaHandHoldingHeart, FaYoutube, FaComments, FaTimes } from 'react-icons/fa';

const MORE = [
  { to: '/market', label: 'Marché', Icon: FaStore },
  { to: '/groups', label: 'Groupes', Icon: FaUsers },
  { to: '/events', label: 'Événements', Icon: FaCalendarAlt },
  { to: '/prayers', label: 'Prières', Icon: FaPrayingHands },
  { to: '/donations', label: 'Dons', Icon: FaHandHoldingHeart },
  { to: '/sermons', label: 'Médias', Icon: FaYoutube },
  { to: '/chat', label: 'Chat global', Icon: FaComments },
  { to: '/members', label: 'Membres', Icon: FaUsers },
];

export default function BottomNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location]);

  const getLinkStyle = ({ isActive }) => ({
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    textDecoration: 'none', color: isActive ? '#DFA92E' : '#888', fontSize: '0.7rem',
    fontWeight: isActive ? 'bold' : 'normal', padding: '8px 0', transition: 'color 0.2s'
  });
  const iconSize = 20;
  const moreActive = MORE.some(m => location.pathname.startsWith(m.to));

  return (
    <>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 'calc(65px + env(safe-area-inset-bottom))', background: 'rgba(0,0,0,0.45)', zIndex: 3000 }}>
          <div onClick={e => e.stopPropagation()} role="dialog" aria-label="Plus"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '20px 20px 0 0',
              padding: '18px 16px 18px', boxShadow: '0 -8px 30px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <strong style={{ fontSize: '1.05rem' }}>Plus</strong>
              <button aria-label="Fermer" onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', padding: 6, color: '#666' }}><FaTimes /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {MORE.map(({ to, label, Icon }) => (
                <Link key={to} to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textDecoration: 'none',
                  color: '#333', fontSize: '0.72rem', textAlign: 'center', padding: '10px 4px', borderRadius: 12, background: '#faf6ec' }}>
                  <Icon size={22} color="#DFA92E" /><span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="bottom-nav">
        <NavLink to="/feed" style={getLinkStyle}><FaNewspaper size={iconSize} style={{ marginBottom: 4 }} /><span>Fil</span></NavLink>
        <NavLink to="/paroisses" style={getLinkStyle}><FaChurch size={iconSize} style={{ marginBottom: 4 }} /><span>Paroisses</span></NavLink>
        <NavLink to="/inbox" style={getLinkStyle}><FaEnvelope size={iconSize} style={{ marginBottom: 4 }} /><span>Messages</span></NavLink>
        <button type="button" onClick={() => setOpen(o => !o)} aria-label="Plus"
          style={{ ...getLinkStyle({ isActive: open || moreActive }), background: 'none', border: 'none', cursor: 'pointer', textTransform: 'none', fontFamily: 'inherit' }}>
          <FaEllipsisH size={iconSize} style={{ marginBottom: 4 }} /><span>Plus</span>
        </button>
        <NavLink to="/profile" style={getLinkStyle}><FaUserCircle size={iconSize} style={{ marginBottom: 4 }} /><span>Profil</span></NavLink>
      </div>
    </>
  );
}
