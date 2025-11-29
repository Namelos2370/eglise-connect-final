import { NavLink } from 'react-router-dom';
import { FaNewspaper, FaUsers, FaComments, FaUserCircle, FaCalendarAlt } from 'react-icons/fa';

export default function BottomNav() {
  
  // Style pour le lien actif (Doré) vs inactif (Gris)
  const getLinkStyle = ({ isActive }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    color: isActive ? '#DFA92E' : '#888', // Var --primary vs gris
    fontSize: '0.75rem', // Texte petit
    fontWeight: isActive ? 'bold' : 'normal',
    padding: '10px 0',
    transition: 'color 0.2s'
  });

  const iconSize = 20;

  return (
    <div className="bottom-nav">
      <NavLink to="/feed" style={getLinkStyle}>
        <FaNewspaper size={iconSize} style={{ marginBottom: 4 }} />
        <span>Fil</span>
      </NavLink>

      <NavLink to="/events" style={getLinkStyle}>
        <FaCalendarAlt size={iconSize} style={{ marginBottom: 4 }} />
        <span>Events</span>
      </NavLink>

      <NavLink to="/groups" style={getLinkStyle}>
        <FaUsers size={iconSize} style={{ marginBottom: 4 }} />
        <span>Groupes</span>
      </NavLink>

      <NavLink to="/inbox" style={getLinkStyle}>
        <FaComments size={iconSize} style={{ marginBottom: 4 }} />
        <span>Chats</span>
      </NavLink>

      <NavLink to="/profile" style={getLinkStyle}>
        <FaUserCircle size={iconSize} style={{ marginBottom: 4 }} />
        <span>Profil</span>
      </NavLink>
    </div>
  );
}