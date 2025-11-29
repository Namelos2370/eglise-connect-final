const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  photo: { type: String, default: '' },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Les membres actifs (qui peuvent voir les posts)
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // NOUVEAU : Les gens en salle d'attente
  pendingMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  isPrivate: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);