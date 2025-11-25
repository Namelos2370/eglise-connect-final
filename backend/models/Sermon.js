const mongoose = require('mongoose');

const sermonSchema = mongoose.Schema({
  title: { type: String, required: true },
  preacher: { type: String, required: true }, // Nom du prédicateur
  videoUrl: { type: String, required: true }, // Lien YouTube
  description: { type: String },
  date: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sermon', sermonSchema);