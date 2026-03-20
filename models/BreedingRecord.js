const mongoose = require('mongoose');

const breedingSchema = new mongoose.Schema({
  owner:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  femaleAnimal:     { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  maleAnimal:       { type: mongoose.Schema.Types.ObjectId, ref: 'Animal' },
  breedingDate:     { type: Date, required: true },
  expectedDelivery: { type: Date },
  actualDelivery:   { type: Date },
  outcome:          { type: String, enum: ['Pending','Successful','Failed','Miscarriage'], default: 'Pending' },
  offspringCount:   { type: Number, default: 0 },
  notes:            { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BreedingRecord', breedingSchema);