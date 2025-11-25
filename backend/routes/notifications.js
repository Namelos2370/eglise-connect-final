const express = require('express');
const router = express.Router(); // <--- C'est cette ligne qui doit être AVANT les routes
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');

// 0. COMPTER LES NON LUES (Pour le Badge rouge)
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: req.auth.userId, read: false });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 1. RÉCUPÉRER MES NOTIFICATIONS
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.auth.userId })
      .sort({ createdAt: -1 }) // Plus récentes d'abord
      .limit(20)
      .populate('sender', 'name photo')
      .populate('postId', 'content'); 
      
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. MARQUER TOUT COMME LU
router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.auth.userId, read: false },
      { read: true }
    );
    res.status(200).json({ message: "Tout est lu" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;