// backend/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  IND_ID: { type: String, unique: true },
  FullName: { type: String, alias: 'Full Name' },
  Event: String,
  State: String,
  Org: String,
  Phone: String,
  Email: String,
  Bio: String,
  Pic: String,
  QRCode: { type: String, alias: 'QR code' },
  FoodEligibility: {
    type: [Number],
    default: Array(9).fill(0),
    alias: 'Food Eligibility' // Alias if needed
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
