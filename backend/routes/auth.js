const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Config Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// 1. INSCRIPTION
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email déjà utilisé." });
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

// 4. UPLOAD PHOTO
router.post('/upload-photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Fichier requis" });
    const user = await User.findById(req.auth.userId);
    user.photo = req.file.path;
    await user.save();
    res.status(200).json({ message: "Avatar mis à jour !", photo: req.file.path });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 5. UPLOAD COVER
router.post('/upload-cover', auth, upload.single('cover'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Fichier requis" });
    const user = await User.findById(req.auth.userId);
    user.coverPhoto = req.file.path;
    await user.save();
    res.status(200).json({ message: "Bannière mise à jour !", coverPhoto: req.file.path });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 6. UPDATE PROFIL
router.put('/update', auth, async (req, res) => {
  try {
    const { name, bio, city, phone, isPublic, preferences } = req.body;
    const updateData = { name, bio, city, phone, isPublic, preferences };
    const updatedUser = await User.findByIdAndUpdate(req.auth.userId, { $set: updateData }, { new: true }).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 7. MOT DE PASSE OUBLIÉ
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "Email inconnu" });
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save();
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
    await transporter.sendMail({ from: process.env.EMAIL_USER, to: user.email, subject: 'Reset Password', text: `Lien : ${resetUrl}` });
    res.status(200).json({ message: "Email envoyé !" });
  } catch (error) { res.status(500).json({ error: "Erreur email" }); }
});

// 8. RESET PASSWORD
router.post('/reset-password/:token', async (req, res) => {
  try {
    const user = await User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: "Lien invalide" });
    user.password = await bcrypt.hash(req.body.password, 10);
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
    res.status(200).json({ message: "Compte supprimé." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==================================================================
// 🛠️ PAGE DE SECOURS : AFFICHAGE RÉSULTAT (NOUVELLE VERSION)
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
            a.btn { display: inline-block; padding: 10px 15px; text-decoration: none; border-radius: 4px; font-weight: bold; color: white; font-size: 14px; }
            .btn-admin { background: #2ecc71; }
            .btn-done { background: #ccc; color: #666; cursor: default; pointer-events: none; }
          </style>
        </head>
        <body>
          <h1>👥 Liste des Utilisateurs</h1>
          <p>Cliquez sur le bouton pour forcer le passage en Admin.</p>
          <table>
            <tr><th>Nom</th><th>Email</th><th>Rôle Actuel</th><th>Action</th></tr>`;
            
    users.forEach(u => {
      const isAdmin = u.role === 'admin';
      // Ce lien ouvre un nouvel onglet pour voir le résultat brut
      html += `<tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td><strong>${u.role || 'user'}</strong></td>
        <td>
            ${isAdmin 
                ? '<span class="btn btn-done">Déjà Admin ✅</span>' 
                : `<a href="/auth/force-admin-id/${u._id}" target="_blank" class="btn btn-admin">⚡ FORCER ADMIN</a>`}
        </td>
      </tr>`;
    });

    html += `</table></body></html>`;
    res.send(html);
  } catch (e) { res.send("Erreur : " + e.message); }
});

// ROUTE D'ACTION QUI AFFICHE LE RÉSULTAT
router.get('/force-admin-id/:id', async (req, res) => {
    try {
        // On force la mise à jour
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { role: 'admin' }, 
            { new: true }
        );
        
        if(!user) return res.send("<h1>Erreur : Utilisateur introuvable</h1>");

        res.send(`
            <div style="text-align:center; padding:50px; font-family:sans-serif;">
                <h1 style="color:green; font-size:40px;">SUCCÈS TOTAL ! 🎉</h1>
                <p style="font-size:20px;">L'utilisateur <strong>${user.name}</strong> est maintenant : <strong>${user.role}</strong></p>
                <br/>
                <a href="http://localhost:3000/admin" style="background:#333; color:white; padding:20px; text-decoration:none; border-radius:10px; font-size:20px;">
                    Aller au Tableau de Bord
                </a>
            </div>
        `);
    } catch (e) {
        res.send(`<h1 style="color:red">ERREUR TECHNIQUE : ${e.message}</h1>`);
    }
});

module.exports = router;