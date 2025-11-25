const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const nodemailer = require('nodemailer');
const auth = require('../middleware/authMiddleware'); // On protège l'envoi

// Configuration du Facteur (Même que dans auth.js)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 1. LISTER LES ABONNÉS
router.get('/', async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ date: -1 });
        res.status(200).json(subs);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 2. AJOUTER UN SEUL EMAIL (Public ou Admin)
router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email requis" });
        
        // Nettoyage de l'email
        const cleanEmail = email.trim().toLowerCase();

        const existing = await Subscriber.findOne({ email: cleanEmail });
        if (existing) return res.status(400).json({ message: "Déjà inscrit !" });

        await Subscriber.create({ email: cleanEmail });
        res.status(201).json({ message: "Inscription réussie !" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 3. IMPORT DE MASSE (NOUVEAU - Copier/Coller une liste)
router.post('/import', auth, async (req, res) => {
    try {
        const { textList } = req.body; // Le gros texte copié/collé
        if (!textList) return res.status(400).json({ error: "Aucun texte fourni." });

        // Regex magique : sépare par virgule, point-virgule, espace ou retour à la ligne
        const rawEmails = textList.split(/[\s,;\n]+/);
        
        let addedCount = 0;
        let duplicateCount = 0;

        for (let email of rawEmails) {
            const cleanEmail = email.trim().toLowerCase();
            // Vérification simple si c'est un email valide
            if (cleanEmail && cleanEmail.includes('@') && cleanEmail.includes('.')) {
                const exists = await Subscriber.findOne({ email: cleanEmail });
                if (!exists) {
                    await Subscriber.create({ email: cleanEmail });
                    addedCount++;
                } else {
                    duplicateCount++;
                }
            }
        }

        res.status(200).json({ 
            message: `Import terminé : ${addedCount} ajoutés, ${duplicateCount} ignorés (déjà existants).` 
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 4. ENVOYER NEWSLETTER À TOUS (NOUVEAU)
router.post('/send', auth, async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) return res.status(400).json({ error: "Sujet et message requis." });

        // Récupérer tous les emails
        const subscribers = await Subscriber.find();
        if (subscribers.length === 0) return res.status(400).json({ error: "Aucun abonné dans la liste." });

        // Créer la liste des destinataires
        const emailList = subscribers.map(sub => sub.email);

        // Option de mail
        const mailOptions = {
            from: `"Église Connect" <${process.env.EMAIL_USER}>`, // Ton Nom <Ton Email>
            // ASTUCE PRO : On met tout le monde en BCC (Copie Cachée Invisible)
            // Comme ça, personne ne voit l'email des autres.
            bcc: emailList, 
            subject: subject,
            text: message, // Version texte brut
            // Version HTML (plus jolie)
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #DFA92E;">⛪ Église Connect</h2>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <h3>${subject}</h3>
                    <p style="white-space: pre-wrap; font-size: 16px; color: #333;">${message}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin-top: 30px;" />
                    <small style="color: #999;">Vous recevez cet email car vous êtes inscrit à la newsletter.</small>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: `Email envoyé avec succès à ${emailList.length} personnes !` });

    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'envoi." }); 
    }
});

// 5. SUPPRIMER UN ABONNÉ
router.delete('/:id', auth, async (req, res) => {
    try {
        await Subscriber.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Abonné supprimé." });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;