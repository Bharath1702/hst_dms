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

    // Convert local time to UTC
    const startUTC = new Date(startDateTime).toISOString();
    const endUTC = new Date(endDateTime).toISOString();

    const validity = await CouponValidity.findOneAndUpdate(
      { couponIndex },
      { startDateTime: startUTC, endDateTime: endUTC },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

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

    // Convert local time to UTC
    const startUTC = new Date(startDateTime).toISOString();
    const endUTC = new Date(endDateTime).toISOString();

    const validity = await CouponValidity.findByIdAndUpdate(
      id,
      { couponIndex, startDateTime: startUTC, endDateTime: endUTC },
      { new: true }
    );

    if (!validity) {
      return res.status(404).json({ message: 'Coupon Validity not found.' });
    }

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
