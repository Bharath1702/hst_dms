// backend/index.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron');
const User = require('./models/User');
const Usage = require('./models/Usage');
const CouponValidity = require('./models/CouponValidity');
const fetchSheetDBDataRoute = require('./routes/fetchSheetDBData');
require('dotenv').config();

const app = express();

// Global CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Replace '*' with specific origin for production
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Middleware
app.use(cors()); // Using cors as middleware globally
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
const couponValidityRoutes = require('./routes/couponValidityRoutes');
const getUsagesRoute = require('./routes/getUsages');

// Use routes
app.use('/api', getAllUsersRoute);
app.use('/api', getUserCouponsRoute);
app.use('/api', getUserDataRoute);
app.use('/api', scanCouponRoute);
app.use('/api', couponValidityRoutes);
app.use('/api', getUsagesRoute);
app.use('/api', fetchSheetDBDataRoute);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Start the server on port 5000
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Schedule the data fetching every 5 minutes
cron.schedule('*/1 * * * *', async () => {
  try {
    console.log('Scheduled Task: Fetching data from SheetDB..');
    const response = await axios.get(`https://hst-dms.vercel.app${PORT}/api/fetch-sheetdb-data`);
    console.log('Scheduled Task: Data fetched and synchronized successfully.');
  } catch (error) {
    console.error('Scheduled Task Error:', error.message);
  }
});
