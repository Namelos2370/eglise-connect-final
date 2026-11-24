const mongoose = require('mongoose');

const parishRequestSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quarter: { type: String, default: '' },
  city: { type: String, default: '' },
  contactName: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  message: { type: String, default: '' },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  parish: { type: mongoose.Schema.Types.ObjectId, ref: 'Parish' }
}, { timestamps: true });

module.exports = mongoose.model('ParishRequest', parishRequestSchema);
