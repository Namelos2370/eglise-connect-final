const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  content: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // NOUVEAU : Si présent, c'est un message privé. Si absent, c'est le chat global.
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' } 
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);