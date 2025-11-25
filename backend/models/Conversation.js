const mongoose = require('mongoose');

const conversationSchema = mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Les 2 personnes
  lastMessage: { type: String }, // Pour l'aperçu dans la liste
  lastMessageDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);