const express        = require('express');
const router         = express.Router();
const AnimalProgress = require('../models/AnimalProgress');
const { protect }    = require('../middleware/auth');

router.use(protect);

// GET all
router.get('/', async (req, res) => {
  try {
    const { animalId } = req.query;
    let query = { owner: req.user._id };
    if (animalId) query.animal = animalId;
    const records = await AnimalProgress.find(query)
      .populate('animal', 'name tagId species')
      .sort({ date: -1 });
    res.json({ success: true, records });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create
router.post('/', async (req, res) => {
  try {
    const {
      animal, date, weight, height, milkProduction,
      healthStatus, notes, imageBase64, imageMimeType,
      videoBase64, videoMimeType, videoLink
    } = req.body;

    const record = await AnimalProgress.create({
      owner: req.user._id,
      animal, date, weight, height,
      milkProduction, healthStatus, notes,
      imageBase64:   imageBase64   || null,
      imageMimeType: imageMimeType || null,
      videoBase64:   videoBase64   || null,
      videoMimeType: videoMimeType || null,
      videoLink:     videoLink     || null,
    });

    res.status(201).json({ success: true, record });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const {
      animal, date, weight, height, milkProduction,
      healthStatus, notes, imageBase64, imageMimeType,
      videoBase64, videoMimeType, videoLink
    } = req.body;

    const record = await AnimalProgress.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      {
        animal, date, weight, height, milkProduction,
        healthStatus, notes,
        imageBase64:   imageBase64   || null,
        imageMimeType: imageMimeType || null,
        videoBase64:   videoBase64   || null,
        videoMimeType: videoMimeType || null,
        videoLink:     videoLink     || null,
      },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, record });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await AnimalProgress.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;