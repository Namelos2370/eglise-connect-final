const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Group = require('../models/Group'); 
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const cleanContent = require('../middleware/cleanContent');

// 1. LIRE LE FIL D'ACTUALITÉ PUBLIC (Exclut strictement les groupes)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ 
        $or: [
            { group: { $exists: false } }, // Le champ n'existe pas
            { group: null }                // Le champ est vide
        ]
    })
    .sort({ createdAt: -1 })
    .populate('author', 'name photo')
    .populate('comments.author', 'name photo');
    
    res.status(200).json(posts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. LIRE LES MESSAGES D'UN GROUPE (SÉCURISÉ - Ordre Chronologique pour Chat)
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    // A. VÉRIFICATION DE SÉCURITÉ
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Groupe introuvable" });

    // On vérifie si l'utilisateur qui demande est bien membre du groupe
    if (!group.members.includes(req.auth.userId)) {
        return res.status(403).json({ message: "Accès refusé. Vous n'êtes pas membre de ce groupe." });
    }

    // B. RÉCUPÉRATION DES MESSAGES (Tout l'historique, trié par date croissante pour le chat)
    const posts = await Post.find({ group: req.params.groupId })
      .sort({ createdAt: 1 }) // 1 = Plus ancien au plus récent (logique Chat)
      .populate('author', 'name photo')
      .populate('comments.author', 'name photo');
      
    res.status(200).json(posts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. LIRE POSTS D'UN UTILISATEUR (Profil public uniquement)
// Cette route est publique (pas de 'auth') pour permettre aux visiteurs de voir les profils
router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ 
        author: req.params.userId,
        $or: [{ group: { $exists: false } }, { group: null }] // On ne montre pas les secrets de groupe sur le profil
    })
    .sort({ createdAt: -1 })
    .populate('author', 'name photo')
    .populate('comments.author', 'name photo');
    res.status(200).json(posts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. PUBLIER (Public ou Groupe)
router.post('/', auth, upload.single('image'), cleanContent, async (req, res) => {
  try {
    if (!req.body.content && !req.file) return res.status(400).json({ error: "Message vide" });

    // Si c'est pour un groupe, on vérifie qu'on est membre (Double sécurité)
    if (req.body.groupId) {
        const group = await Group.findById(req.body.groupId);
        if (!group || !group.members.includes(req.auth.userId)) {
            return res.status(403).json({ error: "Vous ne pouvez pas publier dans ce groupe." });
        }
    }

    const imageUrl = req.file ? req.file.path : null;
    const newPost = new Post({
      content: req.body.content || "",
      image: imageUrl,
      author: req.auth.userId,
      group: req.body.groupId || undefined // C'est ici que le tri se fait à la création
    });

    await newPost.save();
    const populatedPost = await newPost.populate('author', 'name photo');
    res.status(201).json(populatedPost);
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 5. LIKE
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userId = req.auth.userId;
    if (post.likes.includes(userId)) post.likes = post.likes.filter(id => id.toString() !== userId);
    else {
        post.likes.push(userId);
        // Pas de notif si c'est son propre post
        if (post.author.toString() !== userId) {
            await Notification.create({ recipient: post.author, sender: userId, type: 'like', postId: post._id });
        }
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 6. COMMENTER
router.post('/:id/comment', auth, cleanContent, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ text: req.body.text, author: req.auth.userId });
    await post.save();
    if (post.author.toString() !== req.auth.userId) await Notification.create({ recipient: post.author, sender: req.auth.userId, type: 'comment', postId: post._id });
    const updatedPost = await Post.findById(req.params.id).populate('author', 'name photo').populate('comments.author', 'name photo');
    res.status(200).json(updatedPost);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 7. MODIFIER
router.put('/:id', auth, cleanContent, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Introuvable" });
    if (post.author.toString() !== req.auth.userId) return res.status(403).json({ message: "Non autorisé" });
    post.content = req.body.content;
    await post.save();
    res.status(200).json(post);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 8. SUPPRIMER
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Introuvable" });
    
    // On autorise l'auteur OU un admin (optionnel, ici juste l'auteur pour l'instant)
    if (post.author.toString() !== req.auth.userId) return res.status(403).json({ message: "Non autorisé" });
    
    await Post.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Supprimé" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;