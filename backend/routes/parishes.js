const express = require('express');
const router = express.Router();
const Parish = require('../models/Parish');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const slugify = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Crée la paroisse pilote si la base n'en a aucune (idempotent)
async function ensurePilotParish() {
  const exists = await Parish.findOne({ slug: 'saint-blaise-mvog-ebanda' });
  if (exists) return;
  await Parish.create({
    name: 'Paroisse Saint Blaise de Mvog-Ebanda',
    slug: 'saint-blaise-mvog-ebanda',
    city: 'Yaoundé', quarter: 'Mvog-Ebanda', isPilot: true,
    description: "Paroisse pilote du réseau Église Connect : annonces, événements, prières et vie communautaire de la paroisse."
  });
}

const withCount = async (p) => ({ ...p.toObject(), membersCount: await User.countDocuments({ parish: p._id }) });

// 1. LISTE (publique)
router.get('/', async (req, res) => {
  try {
    const list = await Parish.find({ active: true }).sort({ isPilot: -1, name: 1 });
    res.json(await Promise.all(list.map(withCount)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. DÉTAIL par slug (publique)
router.get('/:slug', async (req, res) => {
  try {
    const p = await Parish.findOne({ slug: req.params.slug, active: true }).populate('admins', 'name photo');
    if (!p) return res.status(404).json({ message: 'Paroisse introuvable' });
    res.json(await withCount(p));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. CRÉER (super-admin)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { name, city, quarter, description, logo } = req.body;
    if (!name || !String(name).trim()) return res.status(400).json({ message: 'Nom requis' });
    const slug = slugify(name);
    if (await Parish.findOne({ slug })) return res.status(400).json({ message: 'Cette paroisse existe déjà' });
    res.status(201).json(await Parish.create({ name: name.trim(), slug, city, quarter, description, logo }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. MODIFIER (super-admin ou responsable de la paroisse)
router.put('/:id', auth, async (req, res) => {
  try {
    const p = await Parish.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Paroisse introuvable' });
    const me = await User.findById(req.auth.userId);
    const isManager = me && (me.role === 'admin' || p.admins.some(a => String(a) === String(me._id)));
    if (!isManager) return res.status(403).json({ message: 'Accès refusé' });
    ['name', 'city', 'quarter', 'description', 'logo'].forEach(k => { if (req.body[k] !== undefined) p[k] = req.body[k]; });
    await p.save();
    res.json(p);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. NOMMER UN RESPONSABLE (super-admin)
router.post('/:id/admins', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() }).collation({ locale: 'en', strength: 2 });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    await Parish.updateOne({ _id: req.params.id }, { $addToSet: { admins: user._id } });
    res.json({ message: `${user.name} est responsable de la paroisse.` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// 6. REJOINDRE / QUITTER (le membre choisit sa paroisse)
router.post('/:id/join', auth, async (req, res) => {
  try {
    const p = await Parish.findOne({ _id: req.params.id, active: true });
    if (!p) return res.status(404).json({ message: 'Paroisse introuvable' });
    await User.updateOne({ _id: req.auth.userId }, { $set: { parish: p._id } });
    res.json({ message: `Vous avez rejoint ${p.name}.`, parish: p._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/leave/me', auth, async (req, res) => {
  try {
    await User.updateOne({ _id: req.auth.userId }, { $unset: { parish: 1 } });
    res.json({ message: 'Vous avez quitté votre paroisse.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
module.exports.ensurePilotParish = ensurePilotParish;
