const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // On récupère l'utilisateur complet grâce à l'ID du authMiddleware précédent
    const user = await User.findById(req.auth.userId);
    
    if (user && user.role === 'admin') {
      next(); // C'est bon, c'est un admin
    } else {
      res.status(403).json({ message: "Accès refusé : Admin uniquement." });
    }
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};