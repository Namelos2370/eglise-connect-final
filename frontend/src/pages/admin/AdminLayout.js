import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import API_URL from '../../config';
// AJOUT DE 'FaCommentDots' DANS LES IMPORTS
import { 
  FaChartLine, FaUsers, FaShieldAlt, FaMoneyBillWave, 
  FaHome, FaSignOutAlt, FaEnvelopeOpenText, FaCommentDots, FaChurch, FaCheckCircle 
} from 'react-icons/fa';

export default function AdminLayout() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const [pending, setPending] = useState(0);
  useEffect(() => {
    const load = () => fetch(`${API_URL}/admin/moderation/count`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.ok ? r.json() : null).then(d => d && setPending(d.total)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    window.addEventListener('moderation-changed', load);
    return () => { clearInterval(t); window.removeEventListener('moderation-changed', load); };
  }, [location.pathname]);

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
            <img src="/logo.png" alt="Église Connect" style={{ height:40 }} />
            <h2 style={{ color: 'var(--secondary)', margin:0, fontSize:'1.1rem', textTransform:'uppercase', letterSpacing:'1px' }}>Admin</h2>
        </div>
        
        <nav style={{ flex: 1 }}>
            <Link to="/admin" style={linkStyle(isActive('/admin'))}><FaChartLine /> Tableau de bord</Link>
            <Link to="/admin/moderation" style={linkStyle(isActive('/admin/moderation'))}><FaCheckCircle /> À valider {pending > 0 && <span style={{ background:'#dc2626', color:'white', borderRadius:20, padding:'1px 8px', fontSize:'0.75rem', marginLeft:'auto' }}>{pending}</span>}</Link>
            <Link to="/admin/users" style={linkStyle(isActive('/admin/users'))}><FaUsers /> Utilisateurs</Link>
            <Link to="/admin/content" style={linkStyle(isActive('/admin/content'))}><FaShieldAlt /> Modération</Link>
            <Link to="/admin/finances" style={linkStyle(isActive('/admin/finances'))}><FaMoneyBillWave /> Finances</Link>
            <Link to="/admin/newsletter" style={linkStyle(isActive('/admin/newsletter'))}><FaEnvelopeOpenText /> Newsletter</Link>
            <Link to="/admin/parishes" style={linkStyle(isActive('/admin/parishes'))}><FaChurch /> Paroisses</Link>
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