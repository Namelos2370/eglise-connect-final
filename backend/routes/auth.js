const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const CLIENT_URL = "https://eglise-connect.com"; 


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. INSCRIPTION
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Cet email est déjà utilisé." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ userId: newUser._id, token });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. CONNEXION
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Identifiants incorrects." });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Identifiants incorrects." });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(200).json({ userId: user._id, token });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. MON PROFIL
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId).select('-password');
    if (!user) return res.status(404).json({ message: "Non trouvé" });
    res.status(200).json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. UPLOAD PHOTO DE PROFIL (Cloudinary)
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Fichier requis" });
    
    const imageUrl = req.file.path; // URL Cloudinary directe
    
    const user = await User.findById(req.auth.userId);
    user.photo = imageUrl;
    await user.save();

    res.status(200).json({ message: "Avatar mis à jour !", photo: imageUrl });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 5. UPLOAD PHOTO DE COUVERTURE (Cloudinary)
router.post('/upload-cover', auth, upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Fichier requis" });
    
    const imageUrl = req.file.path; // URL Cloudinary directe
    
    const user = await User.findById(req.auth.userId);
    user.coverPhoto = imageUrl;
    await user.save();

    res.status(200).json({ message: "Bannière mise à jour !", coverPhoto: imageUrl });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 6. METTRE À JOUR LE PROFIL
router.put('/update', auth, async (req, res) => {
  try {
    const { name, bio, city, phone, isPublic, preferences } = req.body;
    const updateData = { name, bio, city, phone, isPublic, preferences };

    const updatedUser = await User.findByIdAndUpdate(
      req.auth.userId,
      { $set: updateData }, 
      { new: true }
    ).select('-password');

    res.status(200).json(updatedUser);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 7. MOT DE PASSE OUBLIÉ (Envoi Email)
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Email inconnu" });

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();

    // Lien pointant vers VOTRE SITE HOSTINGER
    const resetUrl = `${CLIENT_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '🔒 Réinitialisation de mot de passe - Église Connect',
      text: `Vous avez demandé à réinitialiser votre mot de passe.\n\nCliquez ici : ${resetUrl}\n\nSi ce n'est pas vous, ignorez cet email.`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email envoyé !" });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ error: "Erreur lors de l'envoi de l'email" }); 
  }
});

// 8. RÉINITIALISER LE MOT DE PASSE
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Lien invalide ou expiré" });

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Mot de passe changé !" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 9. SUPPRIMER COMPTE
router.delete('/delete', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.auth.userId);
    res.status(200).json({ message: "Compte supprimé définitivement." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==================================================================
// 🛠️ PAGE DE SECOURS : SETUP ADMIN
// ==================================================================
router.get('/setup-admin', async (req, res) => {
  try {
    const users = await User.find();
    let html = `
      <html>
        <head>
          <title>Admin Setup</title>
          <style>
            body { font-family: sans-serif; padding: 40px; background: #f4f4f4; }
            table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            th, td { padding: 15px; border-bottom: 1px solid #ddd; text-align: left; }
            th { background: #333; color: white; }
            a.btn { display: inline-block; padding: 8px 15px; text-decoration: none; border-radius: 4px; font-weight: bold; color: white; font-size: 14px; }
            .btn-admin { background: #2ecc71; }
            .btn-admin:hover { background: #27ae60; }
            .btn-done { background: #ccc; color: #666; cursor: default; pointer-events: none; }
            .link-home { display: inline-block; margin-top: 20px; color: #333; text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>👥 Gestion des Rôles</h1>
          <p>Cliquez sur "Rendre Admin" pour donner les droits suprêmes à un utilisateur.</p>
          <table>
            <tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Action</th></tr>`;
            
    users.forEach(u => {
      const isAdmin = u.role === 'admin';
      html += `<tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><strong>${u.role || 'user'}</strong></td>
        <td>
            ${isAdmin 
                ? '<span class="btn btn-done">Déjà Admin ✅</span>' 
                : `<a href="/auth/force-admin-id/${u._id}" class="btn btn-admin">⚡ Rendre Admin</a>`}
        </td>
      </tr>`;
    });

    html += `</table>
             <br/>
             <a href="${CLIENT_URL}/admin" class="link-home">Aller au Tableau de Bord →</a>
             </body></html>`;
             
    res.send(html);
  } catch (e) { res.send("Erreur : " + e.message); }
});

// Action : Force Admin par ID (Redirection automatique)
router.get('/force-admin-id/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { role: 'admin' });
        res.redirect('/auth/setup-admin'); // Rechargement automatique de la liste
    } catch (e) { res.send("Erreur : " + e.message); }
});

// Action : Force Admin par Email (Route de secours directe)
router.get('/promote-admin/:email', async (req, res) => {
  try {
    const user = await User.findOneAndUpdate({ email: req.params.email }, { role: 'admin' }, { new: true });
    if(!user) return res.status(404).send("<h1>Erreur</h1><p>Aucun utilisateur trouvé avec cet email.</p>");
    res.send(`
        <div style="text-align:center; padding:50px; font-family:sans-serif;">
            <h1 style="color:green">Succès ! 🎉</h1>
            <p>L'utilisateur <strong>${user.email}</strong> est maintenant Administrateur.</p>
            <a href="${CLIENT_URL}/admin" style="background:#333; color:white; padding:10px 20px; text-decoration:none; border-radius:10px; font-size:20px;">Aller au Dashboard</a>
        </div>
    `);
  } catch (error) { res.status(500).send(error.message); }
});

module.exports = router;