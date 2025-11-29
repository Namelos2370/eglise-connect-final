const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  photo: { type: String, default: '' }, // Logo du groupe
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Le responsable (Admin du groupe)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Liste des membres
  isPrivate: { type: Boolean, default: false } // Public par défaut
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);