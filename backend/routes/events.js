const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Version Cloudinary

// 1. CRÉER UN ÉVÉNEMENT (VERSION CLOUDINARY)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "Veuillez ajouter au moins une image." });
    }

    const { title, description, date, location, type } = req.body;
    if (!title || !description || !date || !location) {
        return res.status(400).json({ error: "Tous les champs textes sont obligatoires." });
    }

    // Cloudinary retourne le chemin direct dans file.path
    const imageUrls = req.files.map(file => file.path);

    const event = new Event({
      title, description, date, location, type,
      images: imageUrls,
      organizer: req.auth.userId
    });

    await event.save();
    res.status(201).json({ message: "Créé !", event });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 2. LISTER TOUS (Public)
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }).populate('organizer', 'name photo'); 
    res.status(200).json(events);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. LISTER PAR USER
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.params.userId }).sort({ date: -1 });
    res.status(200).json(events);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. MODIFIER (VERSION CLOUDINARY)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Introuvable" });
    if (event.organizer.toString() !== req.auth.userId) return res.status(403).json({ message: "Non autorisé" });

    const { title, description, date, location, type } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    if (date) event.date = date;
    if (location) event.location = location;
    if (type) event.type = type;

    // Si nouvelles images, on remplace avec les liens Cloudinary
    if (req.files && req.files.length > 0) {
        const imageUrls = req.files.map(file => file.path);
        event.images = imageUrls;
    }

    await event.save();
    res.status(200).json({ message: "Modifié !", event });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 5. SUPPRIMER
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Introuvable" });
    if (event.organizer.toString() !== req.auth.userId) return res.status(403).json({ message: "Non autorisé" });
    await Event.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Supprimé" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 6. RSVP
router.post('/:id/rsvp', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Introuvable" });
    const userId = req.auth.userId;
    let message = "";
    if (event.attendees.includes(userId)) {
      event.attendees = event.attendees.filter(id => id.toString() !== userId);
      message = "Annulé";
    } else {
      event.attendees.push(userId);
      message = "Confirmé";
    }
    await event.save();
    res.status(200).json({ message, attendees: event.attendees });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 7. COMMENTER ÉVÉNEMENT
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Introuvable" });
    event.comments.push({ text: req.body.text, author: req.auth.userId });
    await event.save();
    const updatedEvent = await Event.findById(req.params.id).populate('organizer', 'name photo').populate('comments.author', 'name photo');
    res.status(200).json(updatedEvent);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;