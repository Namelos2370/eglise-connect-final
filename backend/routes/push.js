const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/PushSubscription');
const auth = require('../middleware/authMiddleware');

// Clé publique (nécessaire au navigateur pour s'abonner)
router.get('/public-key', (req, res) => {
  res.status(200).json({ key: process.env.VAPID_PUBLIC_KEY || null });
});

// S'abonner (cet appareil)
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { endpoint, keys } = req.body || {};
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) return res.status(400).json({ message: 'Abonnement invalide.' });
    await PushSubscription.findOneAndUpdate({ endpoint }, { user: req.auth.userId, endpoint, keys }, { upsert: true, new: true });
    res.status(201).json({ message: 'Notifications activées.' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Se désabonner
router.post('/unsubscribe', auth, async (req, res) => {
  try {
    await PushSubscription.deleteOne({ endpoint: req.body.endpoint, user: req.auth.userId });
    res.status(200).json({ message: 'Notifications désactivées.' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
