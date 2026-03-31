const mongoose = require('mongoose');

const cattleSchema = new mongoose.Schema({
  seller:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tagId:         { type: String, required: true },
  name:          { type: String },
  species:       { type: String, required: true, enum: ['Cow','Buffalo','Goat','Sheep','Bull','Calf','Other'] },
  breed:         { type: String },
  gender:        { type: String, enum: ['Male','Female'], required: true },
  age:           { type: Number },
  weight:        { type: Number },
  price:         { type: Number, required: true },
  location:      { type: String },
  description:   { type: String },
  imageBase64:   { type: String },
  imageMimeType: { type: String },
  isAvailable:   { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Cattle', cattleSchema);