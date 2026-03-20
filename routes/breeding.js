const express       = require('express');
const router        = express.Router();
const BreedingRecord = require('../models/BreedingRecord');
const { protect }   = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const records = await BreedingRecord.find({ owner: req.user._id })
      .populate('femaleAnimal', 'name tagId species')
      .populate('maleAnimal',   'name tagId species')
      .sort({ breedingDate: -1 });
    res.json({ success: true, records });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const record = await BreedingRecord.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, record });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const record = await BreedingRecord.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id }, req.body, { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, record });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await BreedingRecord.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;