const express = require('express');
const router = express.Router();
const Prayer = require('../models/Prayer');
const auth = require('../middleware/authMiddleware');

// 1. LISTER LES PRIÈRES (Public ou non, à voir. Ici Public pour lecture)
router.get('/', async (req, res) => {
  try {
    const prayers = await Prayer.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name photo');
    res.status(200).json(prayers);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. AJOUTER UNE REQUÊTE
router.post('/', auth, async (req, res) => {
  try {
    const { content, isAnonymous } = req.body;
    const newPrayer = new Prayer({
      content,
      isAnonymous,
      author: req.auth.userId
    });
    await newPrayer.save();
    res.status(201).json(newPrayer);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 3. "J'AI PRIÉ" (Interaction)
router.post('/:id/pray', auth, async (req, res) => {
  try {
    const prayer = await Prayer.findById(req.params.id);
    const userId = req.auth.userId;

    // Si j'ai déjà prié, je retire, sinon j'ajoute
    if (prayer.prayedBy.includes(userId)) {
      prayer.prayedBy = prayer.prayedBy.filter(id => id.toString() !== userId);
    } else {
      prayer.prayedBy.push(userId);
    }
    await prayer.save();
    res.status(200).json(prayer);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;