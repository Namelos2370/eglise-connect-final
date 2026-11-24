const express = require('express');
const router = express.Router();
const Parish = require('../models/Parish');
const User = require('../models/User');
const ParishRequest = require('../models/ParishRequest');
const upload = require('../middleware/uploadMiddleware');
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


const uniqueSlug = async (name) => {
  const base = slugify(name) || 'paroisse';
  let slug = base, i = 2;
  while (await Parish.findOne({ slug })) slug = `${base}-${i++}`;
  return slug;
};

// ===== DEMANDES D'AJOUT (membre connecté) =====
router.post('/requests', auth, async (req, res) => {
  try {
    const { name, quarter, city, contactName, contactPhone, message } = req.body;
    if (!name || String(name).trim().length < 3) return res.status(400).json({ message: 'Nom de la paroisse requis (3 caractères min).' });
    const pending = await ParishRequest.countDocuments({ requester: req.auth.userId, status: 'pending' });
    if (pending >= 3) return res.status(429).json({ message: 'Vous avez déjà 3 demandes en attente.' });
    const r = await ParishRequest.create({ name: String(name).trim().slice(0, 120), quarter, city, contactName, contactPhone, message: String(message || '').slice(0, 1000), requester: req.auth.userId });
    res.status(201).json({ message: "Demande envoyée ! L'équipe la validera rapidement.", id: r._id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ===== ADMIN =====
router.get('/admin/all', auth, adminOnly, async (req, res) => {
  try {
    const list = await Parish.find().sort({ isPilot: -1, name: 1 }).populate('admins', 'name email');
    res.json(await Promise.all(list.map(withCount)));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/admin/requests', auth, adminOnly, async (req, res) => {
  try {
    res.json(await ParishRequest.find({ status: 'pending' }).sort({ createdAt: -1 }).populate('requester', 'name email phone'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/admin/requests/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const r = await ParishRequest.findById(req.params.id);
    if (!r || r.status !== 'pending') return res.status(404).json({ message: 'Demande introuvable ou déjà traitée.' });
    const parish = await Parish.create({ name: r.name, slug: await uniqueSlug(r.name), city: r.city, quarter: r.quarter, admins: [r.requester] });
    r.status = 'approved'; r.parish = parish._id; await r.save();
    res.json({ message: `Paroisse « ${parish.name} » créée.`, parish });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/admin/requests/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    await ParishRequest.updateOne({ _id: req.params.id, status: 'pending' }, { $set: { status: 'rejected' } });
    res.json({ message: 'Demande refusée.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/admin/:id/toggle', auth, adminOnly, async (req, res) => {
  try {
    const p = await Parish.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Paroisse introuvable' });
    p.active = !p.active; await p.save();
    res.json({ message: p.active ? 'Paroisse activée.' : 'Paroisse désactivée.', active: p.active });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id/admins/:userId', auth, adminOnly, async (req, res) => {
  try {
    await Parish.updateOne({ _id: req.params.id }, { $pull: { admins: req.params.userId } });
    res.json({ message: 'Responsable retiré.' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Logo (super-admin ou responsable)
router.post('/:id/logo', auth, upload.single('logo'), async (req, res) => {
  try {
    const p = await Parish.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Paroisse introuvable' });
    const me = await User.findById(req.auth.userId);
    if (!(me && (me.role === 'admin' || p.admins.some(a => String(a) === String(me._id))))) return res.status(403).json({ message: 'Accès refusé' });
    if (!req.file) return res.status(400).json({ message: 'Fichier requis' });
    p.logo = req.file.path; await p.save();
    res.json({ logo: p.logo });
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
