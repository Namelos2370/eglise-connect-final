const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  photo: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },
  bio: { type: String, default: '' },
  city: { type: String, default: '' },
  phone: { type: String, default: '' },
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
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);