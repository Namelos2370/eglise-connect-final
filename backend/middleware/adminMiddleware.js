const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const user = await User.findById(req.auth.userId);
    if (!user) return res.status(401).json({ message: "Compte introuvable." });
    if (user.role !== 'admin') return res.status(403).json({ message: "Accès refusé : Admin uniquement." });
    next();
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};