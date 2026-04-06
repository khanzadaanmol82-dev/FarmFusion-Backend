const express     = require('express');
const router      = express.Router();
const Voucher     = require('../models/Voucher');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all vouchers
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = { owner: req.user._id };
    if (type) query.type = type;
    const vouchers = await Voucher.find(query).sort({ date: -1 });
    res.json({ success: true, vouchers });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const count = await Voucher.countDocuments({ owner: req.user._id });
    const voucherNumber = `VCH-${Date.now()}-${count + 1}`;
    const voucher = await Voucher.create({ ...req.body, owner: req.user._id, voucherNumber });
    res.status(201).json({ success: true, voucher });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ✅ UPDATE — was missing!
router.put('/:id', async (req, res) => {
  try {
    const voucher = await Voucher.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!voucher) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, voucher });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Voucher.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;