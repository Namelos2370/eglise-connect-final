const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  content: { type: String },
  image: { type: String }, // URL de l'image (Cloudinary)
  
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // NOUVEAU CHAMP CRUCIAL : L'ID du Groupe (optionnel)
  // Si ce champ est rempli, le post est PRIVÉ au groupe.
  // S'il est vide, le post est PUBLIC (Fil d'actu).
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' }, 
  // Paroisse (facultatif)
  parish: { type: mongoose.Schema.Types.ObjectId, ref: 'Parish' },

  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' }, // modération : le contenu existant reste visible
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  comments: [{
    text: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);