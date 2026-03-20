const mongoose = require('mongoose');

const feedingSchema = new mongoose.Schema({
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animal:      { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  feedType:    { type: String, required: true },
  quantity:    { type: Number, required: true },
  unit:        { type: String, enum: ['kg','lbs','liters','grams'], default: 'kg' },
  feedingDate: { type: Date, required: true, default: Date.now },
  cost:        { type: Number, default: 0 },
  notes:       { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FeedingRecord', feedingSchema);