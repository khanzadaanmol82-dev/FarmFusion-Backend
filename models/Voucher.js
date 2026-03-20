const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  voucherNumber: { type: String, required: true },
  type:          { type: String, enum: ['Purchase','Sale','Expense','Income'], required: true },
  amount:        { type: Number, required: true },
  description:   { type: String, required: true },
  date:          { type: Date, required: true, default: Date.now },
  relatedAnimal: { type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }
}, { timestamps: true });

module.exports = mongoose.model('Voucher', voucherSchema);