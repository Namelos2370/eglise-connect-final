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
const groupRoutes = require('./routes/groups');
const serviceRoutes = require('./routes/services');
const projectRoutes = require('./routes/projects');
const parishRoutes = require('./routes/parishes');
const sermonRoutes = require('./routes/sermons');

const app = express();

// --- MIDDLEWARES ---
const allowedOrigins = (process.env.CORS_ORIGINS || 'https://eglise-connect.com,https://www.eglise-connect.com,http://localhost:3000')
  .split(',').map(o => o.trim());
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// Anti-spam / anti-bruteforce : limites par IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));
const strict = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Trop de tentatives, réessayez dans quelques minutes.' } });
app.use(['/auth/login', '/auth/signup', '/auth/forgot-password', '/newsletter/subscribe', '/feedback'], (req, res, next) => req.method === 'POST' ? strict(req, res, next) : next());
app.use(cors({
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error('Origine non autorisée')),
}));

// Limite augmentée pour accepter les gros fichiers (vidéos, audios)
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

// Dossier uploads (gardé par sécurité)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- CONNEXION BASE DE DONNÉES ---
mongoose.connect(process.env.MONGO_URI)
  .then(async () => { console.log('Connexion à MongoDB réussie !'); try { await parishRoutes.ensurePilotParish(); } catch (e) { console.error('Paroisse pilote:', e.message); } })
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
app.use('/groups', groupRoutes);
app.use('/services', serviceRoutes);
app.use('/projects', projectRoutes);
app.use('/sermons', sermonRoutes);
app.use('/parishes', parishRoutes);

app.get('/', (req, res) => {
  res.send('API Église Connect V2.1 en ligne 🚀');
});

// --- DÉMARRAGE ---
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});