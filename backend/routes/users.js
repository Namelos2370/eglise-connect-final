const express = require('express');

const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Masque les coordonnées privées (email, téléphone) des profils non publics,
// sauf pour le propriétaire du profil ou un admin.
const sanitizeUser = (user, viewer) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  const isSelf = viewer && String(obj._id) === String(viewer._id);
  const isAdmin = viewer && viewer.role === 'admin';
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  if (!isSelf && !isAdmin && obj.isPublic === false) {
    delete obj.email;
    delete obj.phone;
    delete obj.city;
    delete obj.bio;
  }
  return obj;
};

// 1. LISTE DE TOUS LES MEMBRES
router.get('/', auth, async (req, res) => {
  try {
    const viewer = await User.findById(req.auth.userId).select('role');
    const users = await User.find().select('-password -resetPasswordToken -resetPasswordExpires');
    res.status(200).json(users.map(u => sanitizeUser(u, viewer)));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. VOIR LE PROFIL D'UN UTILISATEUR SPÉCIFIQUE
router.get('/:id', auth, async (req, res) => {
  try {
    const viewer = await User.findById(req.auth.userId).select('role');
    const user = await User.findById(req.params.id).select('-password -resetPasswordToken -resetPasswordExpires');
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    res.status(200).json(sanitizeUser(user, viewer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
