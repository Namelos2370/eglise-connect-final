const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { PUBLIC, statusFor } = require('../middleware/moderation');
const Notification = require('../models/Notification');
const cleanContent = require('../middleware/cleanContent');

// 1. LISTER TOUS LES MÉDIAS (Public)
router.get('/', async (req, res) => {
  try {
    const medias = await Media.find(PUBLIC)
      .sort({ createdAt: -1 })
      .populate('author', 'name photo')
      .populate('comments.author', 'name photo');
    res.status(200).json(medias);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. PUBLIER UN MÉDIA (Utilisateur connecté)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier requis" });

    // Détection simple du type de fichier
    let type = 'document';
    if (req.file.mimetype.startsWith('video')) type = 'video';
    if (req.file.mimetype.startsWith('audio')) type = 'audio';
    if (req.file.mimetype.startsWith('image')) type = 'image';

    const newMedia = new Media({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      fileUrl: req.file.path,
      fileType: type,
      status: await statusFor(req.auth.userId),
      author: req.auth.userId
    });

    await newMedia.save();
    // On peuple l'auteur pour l'affichage direct
    await newMedia.populate('author', 'name photo');

    res.status(201).json(newMedia);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 3. LIKER / ENLEVER SON LIKE
router.post('/:id/like', auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Introuvable" });
    const userId = req.auth.userId;
    if (media.likes.some(id => id.toString() === userId)) {
      media.likes = media.likes.filter(id => id.toString() !== userId);
    } else {
      media.likes.push(userId);
      if (media.author.toString() !== userId) {
        await Notification.create({ recipient: media.author, sender: userId, type: 'like', mediaId: media._id });
      }
    }
    await media.save();
    res.status(200).json({ likes: media.likes });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. COMMENTER
router.post('/:id/comment', auth, cleanContent, async (req, res) => {
  try {
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: "Commentaire vide" });
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "Introuvable" });
    media.comments.push({ text, author: req.auth.userId });
    await media.save();
    if (media.author.toString() !== req.auth.userId) {
      await Notification.create({ recipient: media.author, sender: req.auth.userId, type: 'comment', mediaId: media._id });
    }
    const fresh = await Media.findById(req.params.id).populate('comments.author', 'name photo');
    res.status(200).json({ comments: fresh.comments });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;