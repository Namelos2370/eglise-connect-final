const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios'); // Indispensable pour parler à Campay
const nodemailer = require('nodemailer');

// Config Email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// 1. STRIPE (CARTE)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0 || amount > 10000000) return res.status(400).json({ error: "Montant invalide." });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), currency: 'eur', automatic_payment_methods: { enabled: true },
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. MOBILE MONEY (CAMPAY - VRAI CODE)
router.post('/mobile-payment', async (req, res) => {
  try {
    const { amount, email } = req.body;
    
    // Référence unique pour suivre la transaction
    const externalRef = `DON-${Date.now()}`;

    // Configuration de la demande à Campay
    const options = {
      method: 'POST',
      url: 'https://campay.net/api/collect/',
      headers: {
        'Authorization': `Token ${process.env.CAMPAY_TOKEN}`, // Ta clé secrète dans .env
        'Content-Type': 'application/json'
      },
      data: {
        amount: amount,
        currency: "XAF",
        description: "Soutien Église Connect",
        external_reference: externalRef,
        email: email || "anonyme@eglise-connect.com", // Email obligatoire pour Campay
        redirect_url: `${process.env.CLIENT_URL || 'https://eglise-connect.com'}/donations`
      }
    };

    // Envoi de la demande
    const response = await axios(options);

    // Si Campay répond succès, on renvoie le VRAI lien de paiement
    if (response.data && response.data.link) {
        console.log("Lien Campay généré :", response.data.link);
        res.json({ payment_url: response.data.link });
    } else {
        console.error("Erreur Campay :", response.data);
        res.status(400).json({ error: "Impossible de générer le lien de paiement." });
    }

  } catch (error) { 
    console.error("Erreur Serveur Campay :", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Erreur de connexion au service Mobile Money" }); 
  }
});

// 3. ENREGISTRER LE DON (Base de données)
router.post('/', async (req, res) => {
  try {
    const { amount, type, guestName, guestEmail, paymentMethod } = req.body;

    if (!amount || amount <= 0 || amount > 10000000) return res.status(400).json({ error: "Montant invalide." });

    let donorId = null;
    let finalEmail = guestEmail;
    let finalName = guestName || "Bienfaiteur";

    if (req.headers.authorization) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            donorId = decodedToken.userId;
            const user = await User.findById(donorId);
            if (user) { finalEmail = user.email; finalName = user.name; }
        } catch (e) {}
    }
    
    const newDonation = new Donation({
      amount, type, paymentMethod: paymentMethod || 'Carte Bancaire', 
      donor: donorId, guestName: donorId ? undefined : guestName, guestEmail: donorId ? undefined : guestEmail
    });

    await newDonation.save();

    // Email de remerciement
    if (finalEmail) {
        const mailOptions = {
            from: process.env.EMAIL_USER, to: finalEmail, subject: '🙏 Merci pour votre don',
            html: `<div style="padding:20px;"><h2>Église Connect</h2><p>Merci <strong>${finalName}</strong> pour votre don de <strong>${amount} XAF</strong>.</p></div>`
        };
        transporter.sendMail(mailOptions).catch(e => console.error("Erreur mail:", e));
    }

    res.status(201).json({ message: "Don enregistré !", donation: newDonation });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// 4. HISTORIQUE
router.get('/my-history', auth, async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.auth.userId }).sort({ createdAt: -1 });
    res.status(200).json(donations);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;