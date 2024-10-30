// backend/routes/getUserData.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/user/:indId
router.get('/user/:indId', async (req, res) => {
  try {
    const user = await User.findOne({ IND_ID: req.params.indId });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found.' });
    }
  } catch (error) {
    console.error('Error fetching user from MongoDB:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
