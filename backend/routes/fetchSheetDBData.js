// backend/routes/fetchSheetDBData.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
require('dotenv').config();

const SHEETDB_API_URL = process.env.SHEETDB_API_URL;
const SHEETDB_WEBHOOK_TOKEN = process.env.SHEETDB_WEBHOOK_TOKEN; // Ensure this is set in .env

// POST route for webhook-triggered synchronization
router.post('/fetch-sheetdb-data', async (req, res) => {
  try {
    // Verify the webhook token
    const token = req.headers['x-sheetdb-token'] || req.body.token;
    if (token !== SHEETDB_WEBHOOK_TOKEN) {
      return res.status(403).json({ message: 'Forbidden: Invalid token.' });
    }

    // Check if synchronization is already in progress
    if (req.app.locals.isSyncing) {
      console.log('Synchronization already in progress. Skipping this request.');
      return res.status(429).json({ message: 'Synchronization already in progress. Try again later.' });
    }

    // Set the synchronization flag
    req.app.locals.isSyncing = true;

    // Fetch data from SheetDB
    const response = await axios.get(SHEETDB_API_URL);
    const sheetData = response.data;

    // Extract IND_IDs from the SheetDB data
    const sheetIND_IDs = sheetData.map(record => record['IND_ID']);

    // Delete users in MongoDB that are not in the SheetDB data
    await User.deleteMany({ IND_ID: { $nin: sheetIND_IDs } });

    // Prepare bulk operations for upserting
    const bulkOps = sheetData.map(record => {
      const userData = {
        IND_ID: record['IND_ID'],
        FullName: record['Full Name'],
        Event: record['Event'],
        State: record['State'],
        Org: record['Org'],
        Phone: record['Phone'],
        Email: record['Email'],
        Bio: record['Bio'],
        Pic: record['Pic'],
        QRCode: record['QR code'],
        FoodEligibility: [
          Number(record['Food Eligibility 1']),
          Number(record['Food Eligibility 2']),
          Number(record['Food Eligibility 3']),
          Number(record['Food Eligibility 4']),
          Number(record['Food Eligibility 5']),
          Number(record['Food Eligibility 6']),
          Number(record['Food Eligibility 7']),
          Number(record['Food Eligibility 8']),
          Number(record['Food Eligibility 9']),
        ],
      };

      return {
        updateOne: {
          filter: { IND_ID: userData.IND_ID },
          update: { $set: userData },
          upsert: true,
        },
      };
    });

    // Execute bulk operations
    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }

    // Reset the synchronization flag
    req.app.locals.isSyncing = false;

    res.json({ message: 'Data fetched and synchronized successfully via webhook.' });
  } catch (error) {
    console.error('Error fetching data from SheetDB:', error);
    // Reset the synchronization flag in case of error
    req.app.locals.isSyncing = false;
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// GET route for manual synchronization
router.get('/fetch-sheetdb-data', async (req, res) => {
  try {
    // Check if synchronization is already in progress
    if (req.app.locals.isSyncing) {
      console.log('Synchronization already in progress. Skipping this request.');
      return res.status(429).json({ message: 'Synchronization already in progress. Try again later.' });
    }

    // Set the synchronization flag
    req.app.locals.isSyncing = true;

    // Fetch data from SheetDB
    const response = await axios.get(SHEETDB_API_URL);
    const sheetData = response.data;

    // Extract IND_IDs from the SheetDB data
    const sheetIND_IDs = sheetData.map(record => record['IND_ID']);

    // Delete users in MongoDB that are not in the SheetDB data
    await User.deleteMany({ IND_ID: { $nin: sheetIND_IDs } });

    // Prepare bulk operations for upserting
    const bulkOps = sheetData.map(record => {
      const userData = {
        IND_ID: record['IND_ID'],
        FullName: record['Full Name'],
        Event: record['Event'],
        State: record['State'],
        Org: record['Org'],
        Phone: record['Phone'],
        Email: record['Email'],
        Bio: record['Bio'],
        Pic: record['Pic'],
        QRCode: record['QR code'],
        FoodEligibility: [
          Number(record['Food Eligibility 1']),
          Number(record['Food Eligibility 2']),
          Number(record['Food Eligibility 3']),
          Number(record['Food Eligibility 4']),
          Number(record['Food Eligibility 5']),
          Number(record['Food Eligibility 6']),
          Number(record['Food Eligibility 7']),
          Number(record['Food Eligibility 8']),
          Number(record['Food Eligibility 9']),
        ],
      };

      return {
        updateOne: {
          filter: { IND_ID: userData.IND_ID },
          update: { $set: userData },
          upsert: true,
        },
      };
    });

    // Execute bulk operations
    if (bulkOps.length > 0) {
      await User.bulkWrite(bulkOps);
    }

    // Reset the synchronization flag
    req.app.locals.isSyncing = false;

    res.json({ message: 'Data fetched and synchronized successfully.' });
  } catch (error) {
    console.error('Error fetching data from SheetDB:', error);
    // Reset the synchronization flag in case of error
    req.app.locals.isSyncing = false;
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
