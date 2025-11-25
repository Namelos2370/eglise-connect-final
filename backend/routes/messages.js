const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const auth = require('../middleware/authMiddleware');
const cleanContent = require('../middleware/cleanContent'); // <--- VIGILE

// LIRE (Public)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: null }).sort({ createdAt: 1 }).populate('sender', 'name photo');
    res.status(200).json(messages);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ENVOYER (PROTÉGÉ PAR CLEANCONTENT)
router.post('/', auth, cleanContent, async (req, res) => {
  try {
    const newMessage = new Message({
      content: req.body.content, // Nettoyé
      sender: req.auth.userId,
      conversationId: null
    });
    await newMessage.save();
    const populatedMessage = await newMessage.populate('sender', 'name photo');
    res.status(201).json(populatedMessage);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

module.exports = router;