const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  owner:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  animal:         { type: mongoose.Schema.Types.ObjectId, ref: 'Animal', required: true },
  date:           { type: Date, required: true, default: Date.now },
  weight:         { type: Number },
  height:         { type: Number },
  milkProduction: { type: Number },
  healthStatus:   { type: String, enum: ['Excellent', 'Good', 'Fair', 'Poor'], default: 'Good' },
  notes:          { type: String },

  // Image stored as base64 (small, fine for MongoDB)
  imageBase64:    { type: String },
  imageMimeType:  { type: String },

  // ✅ Video stored as a file on disk — only the URL path saved in MongoDB
  // e.g. "/uploads/videos/video_1234567890_abc123.mp4"
  videoUrl:       { type: String },

  // Legacy YouTube / Google Drive links (backward compat)
  videoLink:      { type: String },

}, { timestamps: true });

module.exports = mongoose.model('AnimalProgress', progressSchema);
