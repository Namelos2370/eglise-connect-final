const express = require('express');

const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// 1. LISTE DE TOUS LES MEMBRES
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. VOIR LE PROFIL D'UN UTILISATEUR SPÉCIFIQUE (NOUVEAU)
router.get('/:id', auth, async (req, res) => {
  try {
    // On récupère l'user par son ID (sans le mot de passe bien sûr)
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;