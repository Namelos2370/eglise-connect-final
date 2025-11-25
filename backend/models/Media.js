const mongoose = require('mongoose');

const mediaSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Prédication', 'Louange', 'Témoignage', 'Enseignement', 'Autre'], 
    default: 'Autre' 
  },
  fileUrl: { type: String, required: true }, // Lien vers le fichier Cloudinary
  fileType: { type: String, enum: ['video', 'audio', 'image', 'document'], default: 'video' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);