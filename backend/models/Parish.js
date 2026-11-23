const mongoose = require('mongoose');

const parishSchema = mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  city: { type: String, default: '' },
  quarter: { type: String, default: '' },
  country: { type: String, default: 'Cameroun' },
  description: { type: String, default: '' },
  logo: { type: String, default: '' },
  // Responsables de la paroisse (peuvent la gérer, en plus du super-admin)
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPilot: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Parish', parishSchema);
