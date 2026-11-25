const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');

const enabled = !!(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
if (enabled) {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@eglise-connect.com', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
} else {
  console.warn('ℹ️  Notifications push désactivées (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY absentes). Lancez : node scripts/setup-push.js');
}

// Envoie une notification push à tous les appareils d'un utilisateur. Ne bloque jamais l'appelant.
async function sendPush(userId, payload) {
  if (!enabled) return;
  try {
    const subs = await PushSubscription.find({ user: userId });
    const body = JSON.stringify(payload);
    await Promise.all(subs.map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, body);
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) await PushSubscription.deleteOne({ _id: s._id });
      }
    }));
  } catch (e) { console.error('Erreur push:', e.message); }
}

module.exports = { sendPush, enabled };
