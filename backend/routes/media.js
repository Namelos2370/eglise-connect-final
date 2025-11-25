const express = require('express');
const router = express.Router();
const Media = require('../models/Media');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. LISTER TOUS LES MÉDIAS (Public)
router.get('/', async (req, res) => {
  try {
    const medias = await Media.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name photo');
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
      author: req.auth.userId
    });

    await newMedia.save();
    // On peuple l'auteur pour l'affichage direct
    await newMedia.populate('author', 'name photo');

    res.status(201).json(newMedia);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

module.exports = router;