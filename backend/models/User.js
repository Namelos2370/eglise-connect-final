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