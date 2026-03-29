const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animal:       { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  vaccineName:  { type: String, required: true },
  vaccineType:  { type: String, enum: ['Vaccine', 'Medicine', 'Antibiotic', 'Supplement', 'Other'], default: 'Medicine' },
  dosage:       { type: String },
  date:         { type: Date, required: true },
  nextDueDate:  { type: Date },
  givenBy:      { type: String },
  cost:         { type: Number, default: 0 },
  notes:        { type: String },
  status:       { type: String, enum: ['Given', 'Scheduled', 'Overdue'], default: 'Given' }
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);