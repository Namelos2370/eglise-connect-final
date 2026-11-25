import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API_URL from '../config';

const toKey = (b64) => {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });
const supported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

export default function PushToggle() {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supported()) return;
    navigator.serviceWorker.ready.then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setOn(!!sub && Notification.permission === 'granted')).catch(() => {});
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { toast.info("Notifications refusées. Vous pouvez les autoriser dans les réglages de votre navigateur."); return; }
      const k = await fetch(`${API_URL}/push/public-key`).then((r) => r.json());
      if (!k.key) { toast.error("Les notifications ne sont pas encore disponibles sur le serveur."); return; }
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(k.key) });
      const r = await fetch(`${API_URL}/push/subscribe`, { method: 'POST', headers: auth(), body: JSON.stringify(sub.toJSON()) });
      if (!r.ok) throw new Error();
      setOn(true);
      toast.success('Notifications activées 🔔');
    } catch (e) { toast.error("Impossible d'activer les notifications sur cet appareil."); }
    finally { setBusy(false); }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch(`${API_URL}/push/unsubscribe`, { method: 'POST', headers: auth(), body: JSON.stringify({ endpoint: sub.endpoint }) });
        await sub.unsubscribe();
      }
      setOn(false);
      toast.info('Notifications désactivées.');
    } catch (e) { toast.error('Erreur'); }
    finally { setBusy(false); }
  };

  if (!supported()) {
    return (
      <div style={{ background: '#f9f9f9', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: '0.9em', color: '#666' }}>
        {isIOS() && !isStandalone()
          ? "Pour recevoir les notifications sur iPhone : touchez Partager puis « Sur l'écran d'accueil », puis ouvrez Église Connect depuis cette icône."
          : "Les notifications ne sont pas disponibles sur ce navigateur."}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 20, background: '#f9f9f9', padding: 15, borderRadius: 10 }}>
      <span>🔔 Notifications des messages</span>
      <button onClick={on ? disable : enable} disabled={busy} style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9em', background: on ? '#888' : undefined }}>
        {busy ? '…' : on ? 'Désactiver' : 'Activer'}
      </button>
    </div>
  );
}
