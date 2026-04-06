const express     = require('express');
const router      = express.Router();
const Installment = require('../models/Installment');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET all installments
router.get('/', async (req, res) => {
  try {
    const installments = await Installment.find({ owner: req.user._id }).sort({ createdAt: -1 });
    const today = new Date();
    for (const inst of installments) {
      if (inst.status === 'Active' && inst.dueDate && new Date(inst.dueDate) < today) {
        inst.status = 'Overdue';
        await inst.save();
      }
    }
    res.json({ success: true, installments });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// CREATE
router.post('/', async (req, res) => {
  try {
    const inst = await Installment.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, installment: inst });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ✅ UPDATE — was missing!
router.put('/:id', async (req, res) => {
  try {
    const inst = await Installment.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!inst) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, installment: inst });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// RECORD PAYMENT
router.post('/:id/pay', async (req, res) => {
  try {
    const { amount, note } = req.body;
    const inst = await Installment.findOne({ _id: req.params.id, owner: req.user._id });
    if (!inst) return res.status(404).json({ message: 'Not found' });
    inst.payments.push({ amount, note });
    inst.paidAmount += Number(amount);
    if (inst.paidAmount >= inst.totalAmount) inst.status = 'Completed';
    await inst.save();
    res.json({ success: true, installment: inst });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Installment.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;