const express = require('express');
const router  = express.Router();
const Vaccination = require('../models/Vaccination');
const { protect } = require('../middleware/auth');

router.use(protect);

// Get all vaccinations
router.get('/', async (req, res) => {
  try {
    const { animalId } = req.query;
    let query = { owner: req.user._id };
    if (animalId) query.animal = animalId;
    const records = await Vaccination.find(query)
      .populate('animal', 'name tagId species')
      .sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Create vaccination
router.post('/', async (req, res) => {
  try {
    const record = await Vaccination.create({ ...req.body, owner: req.user._id });
    const populated = await record.populate('animal', 'name tagId species');
    res.status(201).json({ success: true, record: populated });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Update vaccination
router.put('/:id', async (req, res) => {
  try {
    const record = await Vaccination.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body, { new: true }
    ).populate('animal', 'name tagId species');
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, record });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Delete vaccination
router.delete('/:id', async (req, res) => {
  try {
    const record = await Vaccination.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;