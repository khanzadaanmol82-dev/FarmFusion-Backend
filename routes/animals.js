const express = require('express');
const router  = express.Router();
const Animal  = require('../models/Animal');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { species, status, search } = req.query;
    let query = { owner: req.user._id };
    if (species) query.species = species;
    if (status)  query.status  = status;
    if (search)  query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { tagId: { $regex: search, $options: 'i' } }
    ];
    const animals = await Animal.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: animals.length, animals });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const animal = await Animal.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, animal });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const animal = await Animal.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id }, req.body, { new: true, runValidators: true }
    );
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.json({ success: true, animal });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const animal = await Animal.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!animal) return res.status(404).json({ message: 'Animal not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;