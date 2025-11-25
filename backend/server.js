require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const messageRoutes = require('./routes/messages');
const donationRoutes = require('./routes/donations');
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const conversationRoutes = require('./routes/conversations');
const notificationRoutes = require('./routes/notifications');
const prayerRoutes = require('./routes/prayers');
const mediaRoutes = require('./routes/media');
const newsletterRoutes = require('./routes/newsletter');
const adminRoutes = require('./routes/admin');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// --- SÉCURITÉ CORS (Mise en ligne) ---
app.use(cors({
  origin: '*', // Autorise temporairement tout le monde pour faciliter le déploiement
  // Une fois le Frontend en ligne, tu pourras remplacer '*' par l'URL de ton site Vercel
  // ex: origin: ['http://localhost:3000', 'https://eglise-connect.vercel.app'],
  credentials: true
}));

// --- MIDDLEWARES ---
// Limite augmentée pour accepter les vidéos/images lourdes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// --- CONNEXION BASE DE DONNÉES ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.error('Erreur de connexion MongoDB:', err));

// --- ROUTES ---
app.use('/auth', authRoutes);
app.use('/events', eventRoutes);
app.use('/messages', messageRoutes);
app.use('/conversations', conversationRoutes);
app.use('/donations', donationRoutes);
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/notifications', notificationRoutes);
app.use('/prayers', prayerRoutes);
app.use('/media', mediaRoutes);
app.use('/newsletter', newsletterRoutes);
app.use('/admin', adminRoutes);
app.use('/feedback', feedbackRoutes);

// Route de test (Pour vérifier que le serveur est en vie sur Render)
app.get('/', (req, res) => {
  res.send('API Église Connect est EN LIGNE 🚀');
});

// --- DÉMARRAGE ---
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});