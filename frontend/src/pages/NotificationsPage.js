import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaEnvelope, FaBell } from 'react-icons/fa';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3002/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setNotifications(await res.json());
      // Marquer comme lues après chargement
      await fetch('http://localhost:3002/notifications/read-all', {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <FaHeart style={{color:'#e11d48'}} />;
      case 'comment': return <FaComment style={{color:'#3b82f6'}} />;
      case 'message': return <FaEnvelope style={{color:'#10b981'}} />;
      default: return <FaBell />;
    }
  };

  const getLink = (notif) => {
    if (notif.type === 'message') return `/private-chat/${notif.conversationId}`;
    if (notif.type === 'like' || notif.type === 'comment') return `/feed`; // Idéalement vers le post précis
    return '#';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>🔔 Vos Notifications</h2>
      
      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>Rien de nouveau pour le moment.</p>
      ) : (
        <div style={{ display: 'grid', gap: '10px' }}>
          {notifications.map(notif => (
            <Link to={getLink(notif)} key={notif._id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card" style={{ 
                padding: '15px', display: 'flex', alignItems: 'center', gap: '15px',
                background: notif.read ? 'white' : '#fefce8', // Jaune pâle si non lu
                borderLeft: notif.read ? 'none' : '5px solid var(--primary)'
              }}>
                <div style={{ fontSize: '1.5rem' }}>{getIcon(notif.type)}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '0.95em' }}>
                    <strong>{notif.sender?.name}</strong> 
                    {notif.type === 'like' && ' a aimé votre publication.'}
                    {notif.type === 'comment' && ' a commenté votre publication.'}
                    {notif.type === 'message' && ' vous a envoyé un message.'}
                  </p>
                  <small style={{ color: '#999' }}>{new Date(notif.createdAt).toLocaleString()}</small>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}