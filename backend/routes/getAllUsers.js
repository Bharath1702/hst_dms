// backend/routes/getAllUsers.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/allUsers
router.get('/allUsers', async (req, res) => {
  try {
    const users = await User.find({});

    // Transform users to have consistent field names
    const transformedUsers = users.map(user => {
      const userObj = user.toObject();

      // Map 'Full Name' to 'FullName'
      userObj.FullName = userObj.FullName || userObj['Full Name'];
      delete userObj['Full Name'];

      // Map 'QR code' to 'QRCode'
      userObj.QRCode = userObj.QRCode || userObj['QR code'];
      delete userObj['QR code'];

      // Map 'Food Eligibility N' to 'FoodEligibility' array
      if (!userObj.FoodEligibility || userObj.FoodEligibility.length === 0) {
        userObj.FoodEligibility = [];
        for (let i = 1; i <= 9; i++) {
          userObj.FoodEligibility.push(Number(userObj[`Food Eligibility ${i}`]) || 0);
          delete userObj[`Food Eligibility ${i}`];
        }
      }

      return userObj;
    });

    res.json(transformedUsers);
  } catch (error) {
    console.error('Error fetching users from MongoDB:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
