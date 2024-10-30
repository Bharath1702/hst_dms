// backend/routes/getUserCoupons.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/user/:indId/coupons
router.get('/user/:indId/coupons', async (req, res) => {
  try {
    const { indId } = req.params;
    const user = await User.findOne({ IND_ID: indId });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(user.FoodEligibility);
  } catch (error) {
    console.error('Error fetching user coupons:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
