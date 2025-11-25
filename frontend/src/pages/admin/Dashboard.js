import { useState, useEffect } from 'react';
import { FaUsers, FaLayerGroup, FaCalendarCheck, FaCoins } from 'react-icons/fa';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, posts: 0, events: 0, donations: 0 });

  useEffect(() => {
    const fetchStats = async () => {
        const res = await fetch('http://localhost:3002/admin/stats', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if(res.ok) setStats(await res.json());
    };
    fetchStats();
  }, []);

  const Card = ({ icon, title, value, color, bg }) => (
    <div className="card" style={{ 
        display:'flex', alignItems:'center', gap:20, padding:'25px', border:'none',
        background: 'white', boxShadow:'0 5px 20px rgba(0,0,0,0.05)', borderRadius:'15px'
    }}>
        <div style={{ 
            background: bg, width:70, height:70, borderRadius:'20px', 
            display:'flex', alignItems:'center', justifyContent:'center', 
            color: color, fontSize:'1.8rem' 
        }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize:'2.2rem', fontWeight:'800', color:'#333', lineHeight:1 }}>{value}</div>
            <div style={{ color:'#999', textTransform:'uppercase', fontSize:'0.75rem', fontWeight:'bold', marginTop:5, letterSpacing:1 }}>{title}</div>
        </div>
    </div>
  );

  return (
    <div>
        <h1 style={{ margin:'0 0 10px 0', color:'var(--secondary)', fontSize:'2rem' }}>Vue d'ensemble</h1>
        <p style={{ color:'#888', marginBottom:'40px' }}>Bienvenue dans votre centre de contrôle.</p>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'25px' }}>
            <Card icon={<FaUsers />} title="Membres" value={stats.users} color="#3b82f6" bg="#eff6ff" />
            <Card icon={<FaLayerGroup />} title="Publications" value={stats.posts} color="#8b5cf6" bg="#f5f3ff" />
            <Card icon={<FaCalendarCheck />} title="Événements" value={stats.events} color="#f59e0b" bg="#fffbeb" />
            <Card icon={<FaCoins />} title="Dons (XAF)" value={stats.donations} color="#10b981" bg="#ecfdf5" />
        </div>
    </div>
  );
}