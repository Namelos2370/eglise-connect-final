const mongoose = require('mongoose');

const donationSchema = mongoose.Schema({
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['Dîme', 'Offrande', 'Projet', 'Soutien Technique', 'Autre'], 
    default: 'Offrande' 
  },
  paymentMethod: { type: String, default: 'Carte Bancaire' }, 
  
  // Lien vers un compte membre (optionnel)
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  
  // NOUVEAU : Infos pour les invités non connectés
  guestName: { type: String },
  guestEmail: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);