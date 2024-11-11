// backend/routes/couponValidityRoutes.js

const express = require('express');
const router = express.Router();
const CouponValidity = require('../models/CouponValidity');

// GET /api/coupon-validities
router.get('/coupon-validities', async (req, res) => {
  try {
    const validities = await CouponValidity.find();
    res.json(validities);
  } catch (error) {
    console.error('Error fetching coupon validities:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/coupon-validities
router.post('/coupon-validities', async (req, res) => {
  try {
    const { couponIndex, startDateTime, endDateTime } = req.body;

    if (!couponIndex || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: 'couponIndex, startDateTime, and endDateTime are required.' });
    }

    // Validate that startDateTime is before endDateTime
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      return res.status(400).json({ message: 'startDateTime must be before endDateTime.' });
    }

    // Check if a validity for this couponIndex already exists
    let validity = await CouponValidity.findOne({ couponIndex });

    if (validity) {
      // Update existing validity
      validity.startDateTime = new Date(startDateTime);
      validity.endDateTime = new Date(endDateTime);
      await validity.save();
    } else {
      // Create new validity
      validity = new CouponValidity({
        couponIndex,
        startDateTime: new Date(startDateTime),
        endDateTime: new Date(endDateTime),
      });
      await validity.save();
    }

    res.json(validity);
  } catch (error) {
    console.error('Error creating/updating coupon validity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/coupon-validities/:id
router.put('/coupon-validities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { couponIndex, startDateTime, endDateTime } = req.body;

    if (!couponIndex || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: 'couponIndex, startDateTime, and endDateTime are required.' });
    }

    // Validate that startDateTime is before endDateTime
    if (new Date(startDateTime) >= new Date(endDateTime)) {
      return res.status(400).json({ message: 'startDateTime must be before endDateTime.' });
    }

    const validity = await CouponValidity.findById(id);

    if (!validity) {
      return res.status(404).json({ message: 'Coupon Validity not found.' });
    }

    validity.couponIndex = couponIndex;
    validity.startDateTime = new Date(startDateTime);
    validity.endDateTime = new Date(endDateTime);

    await validity.save();

    res.json(validity);
  } catch (error) {
    console.error('Error updating coupon validity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/coupon-validities/:id
router.delete('/coupon-validities/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const validity = await CouponValidity.findByIdAndDelete(id);

    if (!validity) {
      return res.status(404).json({ message: 'Coupon Validity not found.' });
    }

    res.json({ message: 'Coupon Validity deleted successfully.' });
  } catch (error) {
    console.error('Error deleting coupon validity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
