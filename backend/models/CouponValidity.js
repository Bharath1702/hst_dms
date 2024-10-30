// backend/models/CouponValidity.js

const mongoose = require('mongoose');

const CouponValiditySchema = new mongoose.Schema({
  couponIndex: { type: Number, required: true, unique: true },
  startDateTime: { type: Date, required: true },
  endDateTime: { type: Date, required: true }
});

module.exports = mongoose.model('CouponValidity', CouponValiditySchema);
