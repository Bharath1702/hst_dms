// backend/models/CouponValidity.js

const mongoose = require('mongoose');

const CouponValiditySchema = new mongoose.Schema({
  couponIndex: {
    type: Number,
    required: true,
    unique: true,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true, // Optional: Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('CouponValidity', CouponValiditySchema);
