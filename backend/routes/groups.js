const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const isIn = (list, id) => (list || []).some(m => String(m._id || m) === String(id));

// 1. LISTER TOUS LES GROUPES
router.get('/', auth, async (req, res) => {
  try {
    const viewer = await User.findById(req.auth.userId).select('role');
    const isAdmin = viewer && viewer.role === 'admin';
    const groups = await Group.find().populate('leader', 'name photo').sort({ name: 1 });
    // Seuls les membres (et l'admin) savent QUI est dans le groupe ; les autres voient le nombre.
    res.status(200).json(groups.map(g => {
      const o = g.toObject();
      const member = isIn(o.members, req.auth.userId) || (g.leader && String(g.leader._id || g.leader) === String(req.auth.userId));
      o.membersCount = (o.members || []).length;
      o.isMember = member;
      if (!member && !isAdmin) { o.members = []; o.pendingMembers = []; }
      return o;
    }));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. CRÉER UN GROUPE
router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();
    if (name.length < 2) return res.status(400).json({ message: 'Le nom du groupe est requis.' });
    const group = await Group.create({
      name: name.slice(0, 100),
      description: description.slice(0, 1000),
      photo: req.file ? req.file.path : '',
      leader: req.auth.userId,
      members: [req.auth.userId], // Le créateur est automatiquement membre
      isPrivate: req.body.isPrivate === 'true'
    });
    res.status(201).json({ message: 'Groupe créé !', group });
  } catch (error) { res.status(400).json({ error: error.message, message: error.message }); }
});

// 3. REJOINDRE / QUITTER UN GROUPE
router.post('/:id/join', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
    const userId = req.auth.userId;
    if (isIn(group.members, userId)) {
      if (String(group.leader) === String(userId)) return res.status(400).json({ message: 'Le responsable ne peut pas quitter son groupe.' });
      group.members = group.members.filter(id => String(id) !== String(userId));
    } else {
      group.members.push(userId);
    }
    await group.save();
    res.status(200).json({ message: 'Mise à jour effectuée', members: group.members });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. DÉTAILS D'UN GROUPE (avec ses membres)
router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('leader', 'name photo')
      .populate('members', 'name photo bio');
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
    const viewer = await User.findById(req.auth.userId).select('role');
    const isAdmin = viewer && viewer.role === 'admin';
    const o = group.toObject();
    const member = isIn(o.members, req.auth.userId) || (group.leader && String(group.leader._id || group.leader) === String(req.auth.userId));
    o.membersCount = (o.members || []).length;
    o.isMember = member;
    if (!member && !isAdmin) { o.members = []; o.pendingMembers = []; }
    res.status(200).json(o);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 5. SUPPRIMER (responsable du groupe ou admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Groupe introuvable' });
    const me = await User.findById(req.auth.userId).select('role');
    if (String(group.leader) !== String(req.auth.userId) && !(me && me.role === 'admin')) return res.status(403).json({ message: 'Accès refusé' });
    await group.deleteOne();
    res.status(200).json({ message: 'Groupe supprimé' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
