// backend/routes/scanCoupon.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Usage = require('../models/Usage');
const CouponValidity = require('../models/CouponValidity');

// POST /api/scan
router.post('/scan', async (req, res) => {
  try {
    const { IND_ID } = req.body;

    if (!IND_ID) {
      return res.status(400).json({ status: 'red', message: 'IND_ID is required.' });
    }

    const user = await User.findOne({ IND_ID });

    if (!user) {
      return res.json({ status: 'red', message: 'User not found.' });
    }

    const currentTime = new Date();

    // Get all valid coupons at current time
    const validCoupons = await CouponValidity.find({
      startDateTime: { $lte: currentTime },
      endDateTime: { $gte: currentTime }
    });

    if (validCoupons.length === 0) {
      return res.json({ status: 'red', message: 'No valid coupons available at this time.' });
    }

    for (const validCoupon of validCoupons) {
      const couponIndex = validCoupon.couponIndex - 1; // Adjust for zero-based index
      const mealCategory = `Coupon ${validCoupon.couponIndex}`;

      if (couponIndex >= user.FoodEligibility.length) {
        continue;
      }

      if (user.FoodEligibility[couponIndex] === 1) {
        // Record usage
        const usage = new Usage({
          IND_ID,
          couponIndex,
          timestamp: currentTime,
          mealCategory
        });
        await usage.save();

        // Deactivate the used coupon
        user.FoodEligibility[couponIndex] = 0;
        await user.save();

        return res.json({ status: 'green', message: `Coupon ${validCoupon.couponIndex} has been successfully used.` });
      } else {
        return res.json({ status: 'red', message: `Coupon ${validCoupon.couponIndex} is not eligible or already used.` });
      }
    }

    res.json({ status: 'red', message: 'No eligible coupons available at this time.' });
  } catch (error) {
    console.error('Error handling scan:', error);
    res.status(500).json({ status: 'red', message: 'Server Error.' });
  }
});

module.exports = router;
