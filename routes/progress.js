const express        = require('express');
const router         = express.Router();
const path           = require('path');
const fs             = require('fs');
const AnimalProgress = require('../models/AnimalProgress');
const { protect }    = require('../middleware/auth');

router.use(protect);

// ── Helper: save base64 video to disk ──────────────────────────────
// Returns the public URL path like /uploads/videos/abc123.mp4
const saveVideoToDisk = (base64Video, mimeType) => {
  const ext      = mimeType === 'video/webm' ? '.webm' : '.mp4';
  const filename = `video_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filepath = path.join(__dirname, '..', 'uploads', 'videos', filename);
  const buffer   = Buffer.from(base64Video, 'base64');
  fs.writeFileSync(filepath, buffer);
  return `/uploads/videos/${filename}`; // public URL path
};

// ── Helper: delete video file from disk ────────────────────────────
const deleteVideoFromDisk = (videoUrl) => {
  if (!videoUrl || !videoUrl.startsWith('/uploads/')) return;
  try {
    const filepath = path.join(__dirname, '..', videoUrl);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  } catch (e) {
    console.error('Failed to delete video file:', e.message);
  }
};

// ── GET all records ────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { animalId } = req.query;
    const query = { owner: req.user._id };
    if (animalId) query.animal = animalId;

    const records = await AnimalProgress.find(query)
      .populate('animal', 'name tagId species')
      .sort({ date: -1 });

    res.json({ success: true, records });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST create ────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const {
      animal, date, weight, height, milkProduction,
      healthStatus, notes,
      imageBase64, imageMimeType,
      videoBase64, videoMimeType,   // comes from frontend FFmpeg compression
      videoLink,
    } = req.body;

    // Save video to disk, store only the URL in MongoDB
    let videoUrl = null;
    if (videoBase64 && videoMimeType) {
      videoUrl = saveVideoToDisk(videoBase64, videoMimeType);
    }

    const record = await AnimalProgress.create({
      owner: req.user._id,
      animal, date, weight, height,
      milkProduction, healthStatus, notes,
      imageBase64:   imageBase64   || null,
      imageMimeType: imageMimeType || null,
      videoUrl:      videoUrl      || null,   // ← saved as file URL, NOT base64
      videoLink:     videoLink     || null,
    });

    res.status(201).json({ success: true, record });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ── PUT update ─────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const {
      animal, date, weight, height, milkProduction,
      healthStatus, notes,
      imageBase64, imageMimeType,
      videoBase64, videoMimeType,
      videoLink,
    } = req.body;

    const existing = await AnimalProgress.findOne({ _id: req.params.id, owner: req.user._id });
    if (!existing) return res.status(404).json({ message: 'Not found' });

    // If a new video is uploaded, delete the old file and save the new one
    let videoUrl = existing.videoUrl; // keep old URL by default
    if (videoBase64 && videoMimeType) {
      deleteVideoFromDisk(existing.videoUrl);           // delete old file
      videoUrl = saveVideoToDisk(videoBase64, videoMimeType); // save new file
    } else if (videoBase64 === null && !existing.videoLink) {
      // User removed the video
      deleteVideoFromDisk(existing.videoUrl);
      videoUrl = null;
    }

    const record = await AnimalProgress.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        animal, date, weight, height,
        milkProduction, healthStatus, notes,
        imageBase64:   imageBase64   || null,
        imageMimeType: imageMimeType || null,
        videoUrl:      videoUrl      || null,
        videoLink:     videoLink     || null,
      },
      { new: true }
    );

    res.json({ success: true, record });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// ── DELETE ─────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const record = await AnimalProgress.findOne({ _id: req.params.id, owner: req.user._id });
    if (record?.videoUrl) deleteVideoFromDisk(record.videoUrl); // clean up file

    await AnimalProgress.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
