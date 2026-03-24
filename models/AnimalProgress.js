const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  owner:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animal:         { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date:           { type: Date, required: true, default: Date.now },
  weight:         { type: Number },
  height:         { type: Number },
  milkProduction: { type: Number },
  healthStatus:   { type: String, enum: ['Excellent','Good','Fair','Poor'], default: 'Good' },
  notes:          { type: String },
  imageBase64:    { type: String },
  imageMimeType:  { type: String },
  videoLink:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AnimalProgress', progressSchema);