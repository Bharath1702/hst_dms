const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Usage = require('./models/Usage');
const CouponValidity = require('./models/CouponValidity');
require('dotenv').config();

const app = express();

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

// Import routes
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

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Export the Express app
module.exports = app;
