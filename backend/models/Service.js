const mongoose = require('mongoose');

const serviceSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Bricolage', 'Cours & Soutien', 'Vente Produits', 'Aide à la personne', 'Tech & Pro', 'Autre'], 
    default: 'Autre' 
  },
  price: { type: String, required: true }, // Ex: "5000 FCFA", "À débattre"
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String } // Contact direct optionnel
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);