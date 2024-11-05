// api/routes/getUsages.js

const express = require('express');
const router = express.Router();
const Usage = require('../../backend/models/Usage');

// GET /api/usages - Get all usages with optional filters
router.get('/usages', async (req, res) => {
  try {
    const { IND_ID, couponIndex } = req.query;
    const filter = {};

    if (IND_ID) {
      filter.IND_ID = IND_ID;
    }

    if (couponIndex !== undefined) {
      filter.couponIndex = Number(couponIndex);
    }

    const usages = await Usage.find(filter).sort({ timestamp: -1 });
    res.json(usages);
  } catch (error) {
    console.error('Error fetching usages:', error.message);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
