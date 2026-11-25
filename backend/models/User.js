const mongoose = require('mongoose');
const { isPlaceholderEmail } = require('../middleware/phone');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  photo: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
  phoneKey: { type: String, index: true }, // téléphone normalisé (+237...), sert à la connexion par numéro
  isPublic: { type: Boolean, default: true },
  // Coordonnées (email, téléphone, ville) masquées aux autres membres tant que l'utilisateur n'a pas choisi de les afficher
  showContact: { type: Boolean, default: false },
  // Paroisse (facultatif : vide = communauté générale)
  parish: { type: mongoose.Schema.Types.ObjectId, ref: 'Parish' },
  
  // 👇 LE CHAMP LE PLUS IMPORTANT POUR TOI MAINTENANT 👇
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  preferences: {
    notifications: { type: Boolean, default: true },
    language: { type: String, default: 'fr' }
  }
}, {
  timestamps: true,
  // Les comptes créés avec un numéro de téléphone ont un email technique : on ne l'expose jamais
  toJSON: { transform: (doc, ret) => { delete ret.phoneKey; if (isPlaceholderEmail(ret.email)) { ret.email = ''; ret.phoneOnly = true; } return ret; } },
  toObject: { transform: (doc, ret) => { delete ret.phoneKey; if (isPlaceholderEmail(ret.email)) { ret.email = ''; ret.phoneOnly = true; } return ret; } }
});

module.exports = mongoose.model('User', userSchema);