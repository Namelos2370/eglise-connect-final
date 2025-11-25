const mongoose = require('mongoose');

const prayerSchema = mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Peut être null si anonyme (optionnel)
  isAnonymous: { type: Boolean, default: false },
  prayedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Liste de ceux qui ont prié
}, {
  timestamps: true
});

module.exports = mongoose.model('Prayer', prayerSchema);