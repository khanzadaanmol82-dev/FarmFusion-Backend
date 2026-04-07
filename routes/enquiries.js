const express  = require('express');
const router   = express.Router();
const Enquiry  = require('../models/Enquiry');
const Cattle   = require('../models/Cattle');
const { protect } = require('../middleware/auth');

router.use(protect);

// Submit enquiry (buyer)
router.post('/', async (req, res) => {
  try {
    const { cattleId, buyerName, buyerPhone, offerPrice, message } = req.body;
    const cattle = await Cattle.findById(cattleId);
    if (!cattle || !cattle.isAvailable)
      return res.status(404).json({ message: 'Listing not available' });
    if (cattle.seller.toString() === req.user._id.toString())
      return res.status(400).json({ message: "You can't enquire on your own listing!" });
    const enquiry = await Enquiry.create({
      cattle: cattleId, seller: cattle.seller,
      buyer: req.user._id, buyerName, buyerPhone, offerPrice, message
    });
    res.status(201).json({ success: true, enquiry });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Get received (seller)
router.get('/received', async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ seller: req.user._id })
      .populate('cattle', 'name tagId species price')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get sent (buyer) — with nested populate
router.get('/sent', async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ buyer: req.user._id })
      .populate({
        path: 'cattle',
        select: 'name tagId species price seller',
        populate: { path: 'seller', select: 'name farmName phone' }
      })
      .sort({ updatedAt: -1 });
    res.json({ success: true, enquiries });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Accept / Reject (seller)
router.patch('/:id/status', async (req, res) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    if (enquiry.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    enquiry.status = req.body.status;
    await enquiry.save();
    res.json({ success: true, enquiry });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Delete by seller
router.delete('/:id', async (req, res) => {
  try {
    await Enquiry.findOneAndDelete({ _id: req.params.id, seller: req.user._id });
    res.json({ success: true, message: 'Enquiry deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ✅ Delete sent enquiry by buyer
router.delete('/sent/:id', async (req, res) => {
  try {
    const enquiry = await Enquiry.findOneAndDelete({
      _id: req.params.id,
      buyer: req.user._id
    });
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found' });
    res.json({ success: true, message: 'Enquiry removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;