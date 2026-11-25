import API_URL from '../config';

const toKey = (b64) => {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

export const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
export const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

export async function currentSubscription() {
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

// Abonne cet appareil (la permission doit avoir été accordée ou être demandée suite à un geste de l'utilisateur)
export async function enablePush({ ask = true } = {}) {
  if (!pushSupported()) throw new Error('unsupported');
  let perm = Notification.permission;
  if (perm === 'default' && ask) perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('denied');
  const k = await fetch(`${API_URL}/push/public-key`).then((r) => r.json());
  if (!k.key) throw new Error('server');
  const reg = await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(k.key) });
  const r = await fetch(`${API_URL}/push/subscribe`, { method: 'POST', headers: headers(), body: JSON.stringify(sub.toJSON()) });
  if (!r.ok) throw new Error('subscribe');
  return sub;
}

export async function disablePush() {
  const sub = await currentSubscription();
  if (sub) {
    await fetch(`${API_URL}/push/unsubscribe`, { method: 'POST', headers: headers(), body: JSON.stringify({ endpoint: sub.endpoint }) });
    await sub.unsubscribe();
  }
}
