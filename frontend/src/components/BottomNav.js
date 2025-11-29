import { NavLink } from 'react-router-dom';
import { FaNewspaper, FaUsers, FaUserCircle, FaStore, FaEnvelope } from 'react-icons/fa';

export default function BottomNav() {
  
  const getLinkStyle = ({ isActive }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: isActive ? '#DFA92E' : '#888',
    fontSize: '0.7rem',
    fontWeight: isActive ? 'bold' : 'normal',
    padding: '8px 0',
    transition: 'color 0.2s'
  });

  const iconSize = 20;

  return (
    <div className="bottom-nav">
      <NavLink to="/feed" style={getLinkStyle}>
        <FaNewspaper size={iconSize} style={{ marginBottom: 4 }} />
        <span>Fil</span>
      </NavLink>

      <NavLink to="/market" style={getLinkStyle}>
        <FaStore size={iconSize} style={{ marginBottom: 4 }} />
        <span>Marché</span>
      </NavLink>

      <NavLink to="/groups" style={getLinkStyle}>
        <FaUsers size={iconSize} style={{ marginBottom: 4 }} />
        <span>Groupes</span>
      </NavLink>

      {/* REMPLACEMENT ICI : Messages à la place de Dons */}
      <NavLink to="/inbox" style={getLinkStyle}>
        <FaEnvelope size={iconSize} style={{ marginBottom: 4 }} />
        <span>Messages</span>
      </NavLink>

      <NavLink to="/profile" style={getLinkStyle}>
        <FaUserCircle size={iconSize} style={{ marginBottom: 4 }} />
        <span>Profil</span>
      </NavLink>
    </div>
  );
}