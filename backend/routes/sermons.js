const express = require('express');
const router = express.Router();
const Sermon = require('../models/Sermon');
const auth = require('../middleware/authMiddleware');

// 1. LISTER LES SERMONS
router.get('/', async (req, res) => {
  try {
    const sermons = await Sermon.find().sort({ date: -1 });
    res.status(200).json(sermons);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. AJOUTER UN SERMON
router.post('/', auth, async (req, res) => {
  try {
    const { title, preacher, videoUrl, description, date } = req.body;
    const newSermon = new Sermon({
      title, preacher, videoUrl, description, date,
      addedBy: req.auth.userId
    });
    await newSermon.save();
    res.status(201).json(newSermon);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

module.exports = router;