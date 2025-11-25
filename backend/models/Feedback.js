const mongoose = require('mongoose');

const feedbackSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Si connecté
  guestEmail: { type: String }, // Si visiteur
  type: { 
    type: String, 
    enum: ['Bug', 'Suggestion', 'Appréciation', 'Autre'], 
    default: 'Suggestion' 
  },
  message: { type: String, required: true },
  read: { type: Boolean, default: false }, // Lu par l'admin ?
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);