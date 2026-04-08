const express       = require('express');
const router        = express.Router();
const FeedingRecord = require('../models/FeedingRecord');
const { protect }   = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { animalId } = req.query;
    let query = { owner: req.user._id };
    if (animalId) query.animal = animalId;
    const records = await FeedingRecord.find(query)
      .populate('animal', 'name tagId species')
      .sort({ feedingDate: -1 });
    res.json({ success: true, records });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const record = await FeedingRecord.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, record });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ✅ THIS WAS MISSING — add it
router.put('/:id', async (req, res) => {
  try {
    const record = await FeedingRecord.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ success: true, record });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await FeedingRecord.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;