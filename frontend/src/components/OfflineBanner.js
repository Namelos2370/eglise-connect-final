import React, { useEffect, useState } from 'react';

const OfflineBanner = () => {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);

  useEffect(() => {
    const off = () => setOffline(true);
    const on = () => setOffline(false);
    window.addEventListener('offline', off);
    window.addEventListener('online', on);
    return () => {
      window.removeEventListener('offline', off);
      window.removeEventListener('online', on);
    };
  }, []);

  if (!offline) return null;
  return (
    <div role="status" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000,
      background: '#333', color: '#fff', textAlign: 'center',
      padding: '6px 12px', fontSize: '0.85rem'
    }}>
      Vous êtes hors ligne — vous voyez les dernières données enregistrées.
    </div>
  );
};

export default OfflineBanner;
