// backend/index.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const cron = require('node-cron'); // Import node-cron
const User = require('./models/User');
const Usage = require('./models/Usage');
const CouponValidity = require('./models/CouponValidity');
const fetchSheetDBDataRoute = require('./routes/fetchSheetDBData'); // Existing route
require('dotenv').config();

const app = express();

// CORS Configuration
const allowedOrigins = ['https://hst-dms-frontend.vercel.app', 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // If using cookies or auth headers
}));

// Middleware
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
app.use('/api', fetchSheetDBDataRoute); // Existing fetch route

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
    const response = await axios.get(`https://hst-dms.vercel.app:${PORT}/api/fetch-sheetdb-data`);
    console.log('Scheduled Task: Data fetched and synchronized successfully.');
  } catch (error) {
    console.error('Scheduled Task Error:', error.message);
  }
});
