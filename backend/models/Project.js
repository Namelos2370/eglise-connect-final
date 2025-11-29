const mongoose = require('mongoose');

const projectSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetAmount: { type: Number, required: true }, // Objectif (ex: 100 000 FCFA)
  currentAmount: { type: Number, default: 0 },    // Déjà récolté
  category: { 
    type: String, 
    enum: ['Santé', 'Études', 'Commerce', 'Urgence', 'Église', 'Autre'], 
    default: 'Autre' 
  },
  image: { type: String }, // Photo du projet
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  supporters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Qui a donné
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);