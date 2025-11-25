const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const cleanContent = require('../middleware/cleanContent'); // <--- VIGILE

// 1. LIRE LE FIL (Public)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({ group: { $exists: false } })
      .sort({ createdAt: -1 })
      .populate('author', 'name photo')
      .populate('comments.author', 'name photo');
    res.status(200).json(posts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. LIRE POSTS GROUPE
router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ group: req.params.groupId })
      .sort({ createdAt: -1 })
      .populate('author', 'name photo')
      .populate('comments.author', 'name photo');
    res.status(200).json(posts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. LIRE POSTS USER
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('author', 'name photo')
      .populate('comments.author', 'name photo');
    res.status(200).json(posts);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. PUBLIER (PROTÉGÉ PAR CLEANCONTENT)
router.post('/', auth, upload.single('image'), cleanContent, async (req, res) => {
  try {
    if (!req.body.content && !req.file) return res.status(400).json({ error: "Le post ne peut pas être vide" });

    const imageUrl = req.file ? req.file.path : null;

    const newPost = new Post({
      content: req.body.content || "",
      image: imageUrl,
      author: req.auth.userId,
      group: req.body.groupId || undefined
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
        if (post.author.toString() !== userId) await Notification.create({ recipient: post.author, sender: userId, type: 'like', postId: post._id });
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 6. COMMENTER (PROTÉGÉ PAR CLEANCONTENT)
router.post('/:id/comment', auth, cleanContent, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // req.body.text a été nettoyé par le middleware
    post.comments.push({ text: req.body.text, author: req.auth.userId });
    await post.save();
    if (post.author.toString() !== req.auth.userId) await Notification.create({ recipient: post.author, sender: req.auth.userId, type: 'comment', postId: post._id });
    const updatedPost = await Post.findById(req.params.id).populate('author', 'name photo').populate('comments.author', 'name photo');
    res.status(200).json(updatedPost);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 7. MODIFIER (PROTÉGÉ PAR CLEANCONTENT)
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
    if (post.author.toString() !== req.auth.userId) return res.status(403).json({ message: "Non autorisé" });
    await Post.deleteOne({ _id: req.params.id });
    res.status(200).json({ message: "Supprimé" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;