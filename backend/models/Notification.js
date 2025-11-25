const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'comment', 'message'], 
    required: true 
  },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);