// backend/routes/getAllUsers.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/allUsers
router.get('/allUsers', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching users from MongoDB:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
