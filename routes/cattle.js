const express = require('express');
const router  = express.Router();
const Cattle  = require('../models/Cattle');
const Animal  = require('../models/Animal');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { species, search } = req.query;
    let query = { isAvailable: true };
    if (species) query.species = species;
    if (search)  query.$or = [
      { name:     { $regex: search, $options: 'i' } },
      { breed:    { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } }
    ];
    const cattle = await Cattle.find(query).populate('seller', 'name farmName phone').sort({ createdAt: -1 });
    res.json({ success: true, count: cattle.length, cattle });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const listing = await Cattle.create({ ...req.body, seller: req.user._id });
    res.status(201).json({ success: true, listing });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.post('/:id/buy', async (req, res) => {
  try {
    const listing = await Cattle.findById(req.params.id);
    if (!listing || !listing.isAvailable)
      return res.status(404).json({ message: 'Listing not available' });
    listing.isAvailable = false;
    await listing.save();
    const newAnimal = await Animal.create({
      owner: req.user._id, tagId: listing.tagId, name: listing.name,
      species: listing.species, breed: listing.breed, gender: listing.gender,
      weight: listing.weight, purchasePrice: listing.price, purchaseDate: new Date(),
      notes: 'Purchased from marketplace'
    });
    res.json({ success: true, message: 'Animal purchased!', animal: newAnimal });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
// Update listing
router.put('/:id', async (req, res) => {
  try {
    const listing = await Cattle.findOneAndUpdate(
      { _id: req.params.id, seller: req.user._id },
      req.body,
      { new: true }
    );
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ success: true, listing });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Delete listing
router.delete('/:id', async (req, res) => {
  try {
    const listing = await Cattle.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ success: true, message: 'Listing removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;