// backend/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  IND_ID: { type: String, unique: true },
  'Full Name': String,
  Event: String,
  State: String,
  Org: String,
  Phone: String,
  Email: String,
  Bio: String,
  Pic: String,
  'QR code': String,
  'Food Eligibility 1': Number,
  'Food Eligibility 2': Number,
  'Food Eligibility 3': Number,
  'Food Eligibility 4': Number,
  'Food Eligibility 5': Number,
  'Food Eligibility 6': Number,
  'Food Eligibility 7': Number,
  'Food Eligibility 8': Number,
  'Food Eligibility 9': Number,
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
