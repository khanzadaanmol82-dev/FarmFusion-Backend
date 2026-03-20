const express       = require('express');
const router        = express.Router();
const AnimalProgress = require('../models/AnimalProgress');
const { protect }   = require('../middleware/auth');

router.use(protect);

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

router.post('/', async (req, res) => {
  try {
    const record = await AnimalProgress.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, record });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

module.exports = router;