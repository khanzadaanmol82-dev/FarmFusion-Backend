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
      cattle:     cattleId,
      seller:     cattle.seller,
      buyer:      req.user._id,
      buyerName,  buyerPhone, offerPrice, message
    });
    res.status(201).json({ success: true, enquiry });
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// Get enquiries received (seller sees who wants to buy)
router.get('/received', async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ seller: req.user._id })
      .populate('cattle', 'name tagId species price')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Get enquiries sent (buyer sees what they enquired)
router.get('/sent', async (req, res) => {
  try {
    const enquiries = await Enquiry.find({ buyer: req.user._id })
      .populate('cattle', 'name tagId species price')
      .populate('seller', 'name farmName phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// Accept or Reject enquiry (seller)
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

module.exports = router;