const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. LISTER TOUS LES GROUPES
router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('leader', 'name photo')
      .sort({ name: 1 });
    res.status(200).json(groups);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. CRÉER UN GROUPE
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { name, description, isPrivate } = req.body;
    // Si une photo est envoyée, on prend son URL Cloudinary, sinon vide
    const photoUrl = req.file ? req.file.path : '';

    const newGroup = new Group({
      name,
      description,
      photo: photoUrl,
      leader: req.auth.userId,
      members: [req.auth.userId], // Le créateur est automatiquement membre
      isPrivate: isPrivate === 'true' // Conversion string -> boolean
    });

    await newGroup.save();
    res.status(201).json({ message: "Groupe créé !", group: newGroup });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 3. REJOINDRE / QUITTER UN GROUPE
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const userId = req.auth.userId;

    if (group.members.includes(userId)) {
      // Si déjà membre -> On quitte
      group.members = group.members.filter(id => id.toString() !== userId);
    } else {
      // Sinon -> On rejoint
      group.members.push(userId);
    }
    await group.save();
    res.status(200).json({ message: "Mise à jour effectuée", members: group.members });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. DÉTAILS D'UN GROUPE (Avec ses membres)
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('leader', 'name photo')
      .populate('members', 'name photo bio'); // On récupère les infos des membres
    
    if (!group) return res.status(404).json({ message: "Groupe introuvable" });
    
    res.status(200).json(group);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;