const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');
const cleanContent = require('../middleware/cleanContent'); // <--- VIGILE

// 1. INIT CONV
router.post('/init/:targetId', auth, async (req, res) => {
  try {
    const myId = req.auth.userId;
    const targetId = req.params.targetId;
    let conversation = await Conversation.findOne({ participants: { $all: [myId, targetId] } });
    if (!conversation) {
      conversation = new Conversation({ participants: [myId, targetId], lastMessage: "Nouvelle discussion", lastMessageDate: Date.now() });
      await conversation.save();
      return res.status(201).json({ conversation, isNew: true });
    }
    return res.status(200).json({ conversation, isNew: false });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. LISTE CONVS
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: { $in: [req.auth.userId] } })
    .populate('participants', 'name photo').sort({ lastMessageDate: -1 });
    res.status(200).json(conversations);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. MESSAGES
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).populate('sender', 'name photo');
    res.status(200).json(messages);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. ENVOYER (SÉCURITÉ INVITATION + CLEANCONTENT)
router.post('/:id/messages', auth, cleanContent, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id).populate('participants');
    if (!conversation) return res.status(404).json({ message: "Introuvable" });

    const otherUser = conversation.participants.find(p => p._id.toString() !== req.auth.userId);
    
    // LOGIQUE INVITATION
    if (otherUser && otherUser.isPublic === false) {
        const replyCount = await Message.countDocuments({ conversationId: req.params.id, sender: otherUser._id });
        if (replyCount === 0) {
            const myMessageCount = await Message.countDocuments({ conversationId: req.params.id, sender: req.auth.userId });
            if (myMessageCount >= 1) return res.status(403).json({ error: "Invitation en attente." });
        }
    }

    const newMessage = new Message({
      content: req.body.content, // Nettoyé
      sender: req.auth.userId,
      conversationId: req.params.id
    });
    await newMessage.save();

    await Conversation.findByIdAndUpdate(req.params.id, { lastMessage: req.body.content, lastMessageDate: Date.now() });

    if (otherUser) {
        await Notification.create({ recipient: otherUser._id, sender: req.auth.userId, type: 'message', conversationId: req.params.id });
    }

    const populatedMessage = await newMessage.populate('sender', 'name photo');
    res.status(201).json(populatedMessage);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 5. DELETE CONV
router.delete('/:id', auth, async (req, res) => {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    await Message.deleteMany({ conversationId: req.params.id });
    res.status(200).json({ message: "Conversation supprimée" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 6. MODIFIER MESSAGE (CLEANCONTENT)
router.put('/message/:msgId', auth, cleanContent, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ error: "Message introuvable" });
    if (msg.sender.toString() !== req.auth.userId) return res.status(403).json({ error: "Non autorisé" });
    msg.content = req.body.content;
    await msg.save();
    res.status(200).json(msg);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 7. SUPPRIMER MESSAGE
router.delete('/message/:msgId', auth, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.msgId);
    if (!msg) return res.status(404).json({ error: "Message introuvable" });
    if (msg.sender.toString() !== req.auth.userId) return res.status(403).json({ error: "Non autorisé" });
    await Message.deleteOne({ _id: req.params.msgId });
    res.status(200).json({ message: "Message supprimé" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;