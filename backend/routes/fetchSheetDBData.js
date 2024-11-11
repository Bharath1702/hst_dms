// backend/routes/fetchSheetDBData.js

const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');
require('dotenv').config();

const SHEETDB_API_URL = process.env.SHEETDB_API_URL;
const SHEETDB_WEBHOOK_TOKEN = process.env.SHEETDB_WEBHOOK_TOKEN; // Ensure this is set in .env

// Function to fetch and synchronize data
async function fetchAndSyncData(req, res) {
  try {
    // Check if synchronization is already in progress
    if (req.app.locals.isSyncing) {
      console.log('Synchronization already in progress. Skipping this request.');
      return res
        .status(429)
        .json({ message: 'Synchronization already in progress. Try again later.' });
    }

    // Set the synchronization flag
    req.app.locals.isSyncing = true;

    // Fetch data from SheetDB
    const response = await axios.get(SHEETDB_API_URL);
    const sheetData = response.data;

    // Log the fetched data for debugging
    console.log('Fetched data from SheetDB:', JSON.stringify(sheetData, null, 2));

    // Extract IND_IDs from the SheetDB data
    const sheetIND_IDs = sheetData.map(record => record['IND_ID']);

    // Delete users in MongoDB that are not in the SheetDB data
    await User.deleteMany({ IND_ID: { $nin: sheetIND_IDs } });

    // Prepare bulk operations for upserting
    const bulkOps = sheetData.map(record => {
      // Map data fields to schema fields
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
        FoodEligibility: []
      };

      // Collect Food Eligibility values
      for (let i = 1; i <= 9; i++) {
        const fieldName = `Food Eligibility ${i}`;
        const feValue = record[fieldName];

        // Log the value for debugging
        console.log(`Record IND_ID: ${record['IND_ID']}, ${fieldName}:`, feValue);

        // Convert the value to a number, handle possible string values
        let numValue = 0;
        if (feValue !== undefined && feValue !== null && feValue.toString().trim() !== '') {
          numValue = parseInt(feValue.toString().trim(), 10);
          if (isNaN(numValue)) {
            numValue = 0;
          }
        }

        userData.FoodEligibility.push(numValue);
      }

      // Set the update object
      const updateObj = {
        FullName: userData.FullName,
        Event: userData.Event,
        State: userData.State,
        Org: userData.Org,
        Phone: userData.Phone,
        Email: userData.Email,
        Bio: userData.Bio,
        Pic: userData.Pic,
        QRCode: userData.QRCode,
        FoodEligibility: userData.FoodEligibility
      };

      return {
        updateOne: {
          filter: { IND_ID: userData.IND_ID },
          update: { $set: updateObj },
          upsert: true,
        },
      };
    });

    // Execute bulk operations
    if (bulkOps.length > 0) {
      const result = await User.bulkWrite(bulkOps);
      console.log('Bulk write result:', result);
    }

    // Reset the synchronization flag
    req.app.locals.isSyncing = false;

    res.json({ message: 'Data fetched and synchronized successfully.' });
  } catch (error) {
    console.error('Error fetching data from SheetDB:', error);
    req.app.locals.isSyncing = false;
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
}

// POST route for webhook-triggered synchronization
router.post('/fetch-sheetdb-data', async (req, res) => {
  // Verify the webhook token
  const token = req.headers['x-sheetdb-token'] || req.body.token;
  if (token !== SHEETDB_WEBHOOK_TOKEN) {
    return res.status(403).json({ message: 'Forbidden: Invalid token.' });
  }

  await fetchAndSyncData(req, res);
});

// GET route for manual synchronization
router.get('/fetch-sheetdb-data', async (req, res) => {
  await fetchAndSyncData(req, res);
});

module.exports = router;
