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
  guestEmail: { type: String },

  // Preuve de paiement (Stripe paymentIntent) — unique pour éviter les doublons
  paymentRef: { type: String, unique: true, sparse: true },
  // 'confirmed' = paiement vérifié ; 'pending' = à confirmer par un admin (Mobile Money, PayPal...)
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);