const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Config Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. ENVOYER UN FEEDBACK (Public & Privé)
router.post('/', async (req, res) => {
  try {
    const { type, message, guestEmail } = req.body;
    let userId = null;
    let userName = "Visiteur Anonyme";
    let userEmail = guestEmail || "Email non fourni";

    // Identifier l'utilisateur si connecté
    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded.userId;
            
            // Récupérer les infos pour l'email
            const User = require('../models/User');
            const userObj = await User.findById(userId);
            if (userObj) {
                userName = userObj.name;
                userEmail = userObj.email;
            }
        } catch (e) { console.log("Token invalide ou expiré"); }
    }

    // A. SAUVEGARDE DANS LA BASE DE DONNÉES (Pour le Dashboard)
    const newFeedback = new Feedback({
        user: userId,
        guestEmail: userId ? undefined : guestEmail,
        type,
        message
    });
    await newFeedback.save();

    // B. ENVOI DE L'EMAIL DE NOTIFICATION (Pour toi)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Tu t'envoies le mail à toi-même
      replyTo: userEmail, // Tu pourras répondre directement
      subject: `📢 Nouveau Feedback : ${type}`,
      html: `
        <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #DFA92E;">Nouveau Retour Utilisateur</h2>
          <p><strong>De :</strong> ${userName} (${userEmail})</p>
          <p><strong>Type :</strong> ${type}</p>
          <hr />
          <h3>Message :</h3>
          <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #DFA92E; font-size: 16px;">
            ${message}
          </p>
          <hr />
          <p style="font-size: 12px; color: #888;">
            Message enregistré dans le Tableau de Bord.
          </p>
        </div>
      `
    };

    // On envoie le mail de manière asynchrone (on n'attend pas la fin pour répondre au client)
    transporter.sendMail(mailOptions).catch(err => console.error("Erreur envoi mail feedback:", err));

    res.status(201).json({ message: "Merci pour votre retour !" });
  } catch (error) { 
    console.error("Erreur Feedback:", error);
    res.status(500).json({ error: error.message }); 
  }
});

// 2. ADMIN : LIRE TOUS LES FEEDBACKS
router.get('/all', auth, admin, async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. ADMIN : SUPPRIMER UN FEEDBACK
router.delete('/:id', auth, admin, async (req, res) => {
    try {
        await Feedback.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Supprimé." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;