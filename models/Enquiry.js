const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  cattle:      { type: mongoose.Schema.Types.ObjectId, ref: 'Cattle', required: true },
  seller:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyer:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName:   { type: String, required: true },
  buyerPhone:  { type: String, required: true },
  offerPrice:  { type: Number },
  message:     { type: String },
  status:      { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);