import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { pushSupported, isIOS, isStandalone, enablePush, disablePush, currentSubscription } from '../utils/push';

export default function PushToggle() {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!pushSupported()) return;
    currentSubscription()
      .then((sub) => setOn(!!sub && Notification.permission === 'granted'))
      .catch(() => {});
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      await enablePush();
      setOn(true);
      toast.success('Notifications activées 🔔');
    } catch (e) {
      if (e.message === 'denied') toast.info("Notifications refusées. Autorisez-les dans les réglages de votre navigateur.");
      else if (e.message === 'server') toast.error("Les notifications ne sont pas encore disponibles sur le serveur.");
      else toast.error("Impossible d'activer les notifications sur cet appareil.");
    } finally { setBusy(false); }
  };

  const disable = async () => {
    setBusy(true);
    try {
      await disablePush();
      setOn(false);
      toast.info('Notifications désactivées.');
    } catch (e) { toast.error('Erreur'); }
    finally { setBusy(false); }
  };

  if (!pushSupported()) {
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
