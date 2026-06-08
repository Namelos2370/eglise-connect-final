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

// PROMOTION ADMIN SÉCURISÉE (nécessite d'être déjà admin OU clé secrète serveur)
router.post('/promote-admin', auth, async (req, res) => {
  try {
    const requester = await User.findById(req.auth.userId);
    if (!requester || requester.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé." });
    }
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email requis." });
    const target = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (!target) return res.status(404).json({ message: "Utilisateur introuvable." });
    res.status(200).json({ message: `${target.email} est maintenant admin.` });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;