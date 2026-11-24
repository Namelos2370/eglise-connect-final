const User = require('../models/User');

// Filtre appliqué à toutes les listes publiques : seuls les contenus validés (ou antérieurs à la modération) sont visibles
const PUBLIC = { status: { $nin: ['pending', 'rejected'] } };

// Statut d'un nouveau contenu : validé d'office pour un admin, sinon en attente
async function statusFor(userId) {
  const u = await User.findById(userId).select('role');
  return u && u.role === 'admin' ? 'approved' : 'pending';
}

module.exports = { PUBLIC, statusFor };
