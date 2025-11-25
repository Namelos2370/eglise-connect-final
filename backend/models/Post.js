const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  content: { type: String, required: true },
  image: { type: String }, // URL de l'image optionnelle
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Qui a aimé ?
  comments: [{
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);