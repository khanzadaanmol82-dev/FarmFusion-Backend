const mongoose = require('mongoose');

const installmentSchema = new mongoose.Schema({
  owner:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:             { type: String, required: true },
  totalAmount:       { type: Number, required: true },
  paidAmount:        { type: Number, default: 0 },
  installmentAmount: { type: Number, required: true },
  frequency:         { type: String, enum: ['Weekly','Monthly','Quarterly'], default: 'Monthly' },
  startDate:         { type: Date, required: true },
  dueDate:           { type: Date },
  status:            { type: String, enum: ['Active','Completed','Overdue','Cancelled'], default: 'Active' },
  payments: [{
    amount: { type: Number },
    paidOn: { type: Date, default: Date.now },
    note:   { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Installment', installmentSchema);