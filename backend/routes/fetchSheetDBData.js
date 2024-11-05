// backend/routes/fetchSheetDBData.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
require('dotenv').config();

const SHEETDB_API_URL = process.env.SHEETDB_API_URL;

router.get('/fetch-sheetdb-data', async (req, res) => {
  try {
    const response = await axios.get(SHEETDB_API_URL);
    const sheetData = response.data;

    for (const record of sheetData) {
      const userData = {
        IND_ID: record.IND_ID,
        FullName: record.FullName,
        Event: record.Event,
        State: record.State,
        Org: record.Org,
        Phone: record.Phone,
        Email: record.Email,
        Bio: record.Bio,
        Pic: record.Pic,
        QRCode: record.QRCode,
        FoodEligibility: record.FoodEligibility
          ? record.FoodEligibility.split(',').map(Number)
          : Array(9).fill(0),
      };

      await User.updateOne(
        { IND_ID: userData.IND_ID },
        { $set: userData },
        { upsert: true }
      );
    }

    res.json({ message: 'Data fetched and updated successfully.' });
  } catch (error) {
    console.error('Error fetching data from SheetDB:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
