// backend/routes/updateCouponSchedule.js

const express = require('express');
const router = express.Router();
const CouponValidity = require('../models/CouponValidity');

// POST /api/coupon-validities
router.post('/coupon-validities', async (req, res) => {
  try {
    const { couponIndex, startDateTime, endDateTime } = req.body;

    if (!couponIndex || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: 'couponIndex, startDateTime, and endDateTime are required.' });
    }

    const validity = await CouponValidity.findOneAndUpdate(
      { couponIndex },
      { startDateTime: new Date(startDateTime), endDateTime: new Date(endDateTime) },
      { upsert: true, new: true }
    );

    res.json(validity);
  } catch (error) {
    console.error('Error updating coupon validity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
