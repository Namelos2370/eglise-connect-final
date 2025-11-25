import { Link, Outlet, useLocation } from 'react-router-dom';
// AJOUT DE 'FaCommentDots' DANS LES IMPORTS
import { 
  FaChartLine, FaUsers, FaShieldAlt, FaMoneyBillWave, 
  FaHome, FaSignOutAlt, FaEnvelopeOpenText, FaCommentDots 
} from 'react-icons/fa';

export default function AdminLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const layoutStyle = { display: 'flex', minHeight: '100vh', background: '#f3f4f6' };
  const sidebarStyle = {
    width: '260px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', padding: '25px', boxSizing: 'border-box', position: 'fixed', height: '100vh', left: 0, top: 0, boxShadow: '5px 0 20px rgba(0,0,0,0.02)'
  };
  const contentStyle = { flex: 1, marginLeft: '260px', padding: '40px', overflowY: 'auto' };
  const linkStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', color: active ? 'white' : '#666', background: active ? 'linear-gradient(135deg, var(--primary) 0%, #c6921e 100%)' : 'transparent', textDecoration: 'none', borderRadius: '12px', marginBottom: '8px', transition: 'all 0.2s ease', fontWeight: active ? 'bold' : '500', boxShadow: active ? '0 4px 10px rgba(223, 169, 46, 0.3)' : 'none'
  });

  return (
    <div style={layoutStyle}>
      <div style={sidebarStyle}>
        <div style={{ marginBottom:'40px', paddingLeft:'10px', display:'flex', alignItems:'center', gap:10 }}>
            <img src="/logo.png" alt="Logo" style={{ height:40 }} />
            <h2 style={{ color: 'var(--secondary)', margin:0, fontSize:'1.1rem', textTransform:'uppercase', letterSpacing:'1px' }}>Admin</h2>
        </div>
        
        <nav style={{ flex: 1 }}>
            <Link to="/admin" style={linkStyle(isActive('/admin'))}><FaChartLine /> Tableau de bord</Link>
            <Link to="/admin/users" style={linkStyle(isActive('/admin/users'))}><FaUsers /> Utilisateurs</Link>
            <Link to="/admin/content" style={linkStyle(isActive('/admin/content'))}><FaShieldAlt /> Modération</Link>
            <Link to="/admin/finances" style={linkStyle(isActive('/admin/finances'))}><FaMoneyBillWave /> Finances</Link>
            <Link to="/admin/newsletter" style={linkStyle(isActive('/admin/newsletter'))}><FaEnvelopeOpenText /> Newsletter</Link>
            {/* C'EST ICI QUE L'ICÔNE EST UTILISÉE */}
            <Link to="/admin/feedback" style={linkStyle(isActive('/admin/feedback'))}><FaCommentDots /> Avis & Bugs</Link>
        </nav>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
            <Link to="/" style={{...linkStyle(false), color:'var(--secondary)', fontWeight:'bold'}}><FaHome /> Retour au Site</Link>
        </div>
      </div>

      <div style={contentStyle}>
        <div style={{ maxWidth:'1000px', margin:'0 auto' }}>
            <Outlet />
        </div>
      </div>
    </div>
  );
}