const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  owner:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tagId:         { type: String, required: true, trim: true },
  name:          { type: String, trim: true },
  species:       { type: String, required: true, enum: ['Cow','Buffalo','Goat','Sheep','Bull','Calf','Other'] },
  breed:         { type: String, trim: true },
  gender:        { type: String, enum: ['Male','Female'], required: true },
  dateOfBirth:   { type: Date },
  weight:        { type: Number, min: 0 },
  color:         { type: String, trim: true },
  status:        { type: String, enum: ['Healthy','Sick','Pregnant','Sold','Deceased'], default: 'Healthy' },
  purchasePrice: { type: Number, min: 0 },
  purchaseDate:  { type: Date },
  notes:         { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Animal', animalSchema);