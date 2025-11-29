const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const auth = require('../middleware/authMiddleware');
const cleanContent = require('../middleware/cleanContent'); // Protection anti-insultes

// 1. LISTER LES SERVICES (Public ou Connecté)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name photo city');
    res.status(200).json(services);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. PUBLIER UNE ANNONCE
router.post('/', auth, cleanContent, async (req, res) => {
  try {
    const { title, description, category, price, phone } = req.body;
    
    const newService = new Service({
      title, description, category, price, phone,
      author: req.auth.userId
    });

    await newService.save();
    const populatedService = await newService.populate('author', 'name photo city');
    res.status(201).json(populatedService);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 3. SUPPRIMER UNE ANNONCE (Auteur ou Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if(!service) return res.status(404).json({ message: "Introuvable" });

    // Vérif droit (Auteur ou Admin ?)
    // Note: Pour l'admin, il faudrait vérifier le rôle user, ici on laisse l'auteur simple
    if (service.author.toString() !== req.auth.userId) {
        return res.status(403).json({ message: "Non autorisé" });
    }

    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Annonce supprimée." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;