const express   = require('express');
const router    = express.Router();
const Voucher   = require('../models/Voucher');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    let query = { owner: req.user._id };
    if (type) query.type = type;
    const vouchers = await Voucher.find(query).sort({ date: -1 });
    res.json({ success: true, vouchers });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const count = await Voucher.countDocuments({ owner: req.user._id });
    const voucherNumber = `VCH-${Date.now()}-${count + 1}`;
    const voucher = await Voucher.create({ ...req.body, owner: req.user._id, voucherNumber });
    res.status(201).json({ success: true, voucher });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Voucher.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;