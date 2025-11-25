const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Donation = require('../models/Donation');
const Subscriber = require('../models/Subscriber');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const nodemailer = require('nodemailer');

// Configuration Email (Pour la Newsletter)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// SÉCURITÉ : TOUTES LES ROUTES SONT PROTÉGÉES ADMIN
router.use(auth, admin);

// 1. STATISTIQUES
router.get('/stats', async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const postsCount = await Post.countDocuments();
    const eventsCount = await Event.countDocuments();
    const donationsTotal = await Donation.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);
    const subscribersCount = await Subscriber.countDocuments();
    
    res.status(200).json({
      users: usersCount,
      posts: postsCount,
      events: eventsCount,
      donations: donationsTotal[0]?.total || 0,
      subscribers: subscribersCount
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. UTILISATEURS
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Post.deleteMany({ author: req.params.id });
    await Event.deleteMany({ organizer: req.params.id });
    res.status(200).json({ message: "Utilisateur supprimé." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. CONTENU (Posts, Events, Commentaires)
router.get('/content', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50).populate('author', 'name email');
    const events = await Event.find().sort({ createdAt: -1 }).limit(50).populate('organizer', 'name email');
    
    let allComments = [];
    posts.forEach(post => {
        if (post.comments && post.comments.length > 0) {
            post.comments.forEach(comment => {
                allComments.push({
                    _id: comment._id, postId: post._id, text: comment.text,
                    author: comment.author, date: comment.createdAt, postTitle: post.content.substring(0, 20) + "..."
                });
            });
        }
    });
    allComments.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({ posts, events, comments: allComments });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/posts/:id', async (req, res) => {
  try { await Post.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Supprimé." }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/events/:id', async (req, res) => {
  try { await Event.findByIdAndDelete(req.params.id); res.status(200).json({ message: "Supprimé." }); } 
  catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/comments/:postId/:commentId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if(!post) return res.status(404).json({message: "Introuvable"});
        post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
        await post.save();
        res.status(200).json({ message: "Commentaire supprimé." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. FINANCES
router.get('/finances', async (req, res) => {
  try {
    const donations = await Donation.find().sort({ createdAt: -1 }).populate('donor', 'name email');
    res.status(200).json(donations);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 5. NEWSLETTER
router.get('/newsletter', async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ date: -1 });
        res.status(200).json(subs);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/newsletter', async (req, res) => {
    try {
        const { email } = req.body;
        const exists = await Subscriber.findOne({ email });
        if(exists) return res.status(400).json({ message: "Email déjà inscrit." });
        await Subscriber.create({ email });
        res.status(201).json({ message: "Ajouté avec succès." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/newsletter/:id', async (req, res) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Supprimé." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/newsletter/import', async (req, res) => {
    try {
        const { textList } = req.body;
        if (!textList) return res.status(400).json({ error: "Liste vide." });
        const rawEmails = textList.split(/[\s,;\n]+/);
        let added = 0;
        for (let email of rawEmails) {
            const cleanEmail = email.trim().toLowerCase();
            if (cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                const exists = await Subscriber.findOne({ email: cleanEmail });
                if (!exists) { await Subscriber.create({ email: cleanEmail }); added++; }
            }
        }
        res.status(200).json({ message: `${added} emails importés.` });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/newsletter/send', async (req, res) => {
    try {
        const { subject, message } = req.body;
        const subscribers = await Subscriber.find();
        if (subscribers.length === 0) return res.status(400).json({ error: "Aucun abonné." });
        const emailList = subscribers.map(s => s.email);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            bcc: emailList,
            subject: subject,
            text: message,
            html: `<div style="padding:20px;"><h2>Église Connect</h2><hr/><p>${message}</p></div>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: `Envoyé à ${emailList.length} personnes.` });
    } catch (error) { res.status(500).json({ error: "Erreur d'envoi." }); }
});

module.exports = router;