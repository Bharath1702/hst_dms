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
  QRCode: String,
  FoodEligibility: {
    type: [parseInt],
    default: Array(9).fill(0)
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
