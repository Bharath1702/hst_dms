// backend/index.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const fetchSheetDBDataRoute = require('./routes/fetchSheetDBData');
require('dotenv').config();

const app = express();

// Global CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Adjust this in production for security
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Import other routes
const getAllUsersRoute = require('./routes/getAllUsers');
const getUserCouponsRoute = require('./routes/getUserCoupons');
const getUserDataRoute = require('./routes/getUserData');
const scanCouponRoute = require('./routes/scanCoupon');
const couponValidityRoutes = require('./routes/couponValidityRoutes'); // Updated route
const getUsagesRoute = require('./routes/getUsages');

// Use routes
app.use('/api', getAllUsersRoute);
app.use('/api', getUserCouponsRoute);
app.use('/api', getUserDataRoute);
app.use('/api', scanCouponRoute);
app.use('/api', couponValidityRoutes); // Use the updated coupon validity routes
app.use('/api', getUsagesRoute);
app.use('/api', fetchSheetDBDataRoute);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Route to fetch and sync data from SheetDB
app.get('/api/fetch-and-sync', async (req, res) => {
  try {
    console.log('Fetching data from SheetDB...');
    const response = await axios.get(process.env.SHEETDB_API_URL);
    const data = response.data;

    // Update database with data from SheetDB (adjust this logic based on your data model)
    await User.deleteMany(); // Clear existing data (optional)
    await User.insertMany(data); // Insert new data

    console.log('Data fetched and synchronized successfully.');
    res.status(200).json({ message: 'Data fetched and synchronized successfully.' });
  } catch (error) {
    console.error('Error fetching data from SheetDB:', error.message);
    res.status(500).json({ error: 'Error fetching data' });
  }
});

// Start the server
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
