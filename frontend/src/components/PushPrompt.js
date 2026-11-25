import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { pushSupported, isIOS, isStandalone, enablePush, currentSubscription } from '../utils/push';

const DISMISS_KEY = 'ec_push_dismissed';
const DAYS = 3;

// Notifications activées par défaut : abonnement automatique si déjà autorisé,
// sinon invitation d'un seul geste (les navigateurs interdisent de demander l'autorisation sans clic).
export default function PushPrompt() {
  const { user } = useContext(AuthContext);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user || !pushSupported() || user.preferences?.notifications === false) return;
    if (isIOS() && !isStandalone()) return; // iPhone : seulement si le site est installé sur l'écran d'accueil
    let cancelled = false;
    (async () => {
      try {
        if (Notification.permission === 'granted') { await enablePush({ ask: false }); return; }
        if (Notification.permission === 'denied') return;
        const sub = await currentSubscription();
        const last = Number(localStorage.getItem(DISMISS_KEY) || 0);
        if (!sub && Date.now() - last > DAYS * 86400000 && !cancelled) setTimeout(() => !cancelled && setShow(true), 4000);
      } catch (e) { /* silencieux */ }
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!show) return null;

  const later = () => { localStorage.setItem(DISMISS_KEY, String(Date.now())); setShow(false); };
  const activate = async () => {
    setShow(false);
    try { await enablePush(); toast.success('Notifications activées 🔔'); }
    catch (e) { if (e.message === 'denied') localStorage.setItem(DISMISS_KEY, String(Date.now())); }
  };

  return (
    <div role="dialog" aria-label="Activer les notifications" style={{
      position: 'fixed', left: 12, right: 12, bottom: 80, zIndex: 9000, maxWidth: 460, margin: '0 auto',
      background: '#fff', border: '1px solid var(--primary)', borderRadius: 14, padding: 14,
      boxShadow: '0 8px 30px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 12
    }}>
      <span style={{ fontSize: '1.6rem' }}>🔔</span>
      <div style={{ flex: 1, fontSize: '0.9rem' }}>
        <strong>Ne manquez aucun message</strong>
        <div style={{ color: '#666' }}>Recevez une notification quand on vous écrit.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button onClick={activate} style={{ padding: '8px 14px', fontSize: '0.85rem', width: 'auto' }}>Activer</button>
        <button onClick={later} style={{ padding: '4px 14px', fontSize: '0.8rem', width: 'auto', background: 'none', color: '#888', boxShadow: 'none' }}>Plus tard</button>
      </div>
    </div>
  );
}
