// backend/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  IND_ID: {
    type: String,
    required: true,
    unique: true,
  },
  FullName: {
    type: String,
    required: true,
  },
  Event: {
    type: String,
    default: '',
  },
  State: {
    type: String,
    default: '',
  },
  Org: {
    type: String,
    default: '',
  },
  Phone: {
    type: String,
    default: '',
  },
  Email: {
    type: String,
    default: '',
  },
  Bio: {
    type: String,
    default: '',
  },
  Pic: {
    type: String,
    default: '',
  },
  QRCode: {
    type: String,
    default: '',
  },
  FoodEligibility: {
    type: [Number],
    default: () => Array(9).fill(0), // Each document gets its own array
    validate: {
      validator: function(arr) {
        return arr.length === 9 && arr.every(num => num === 0 || num === 1);
      },
      message: 'FoodEligibility array must contain exactly 9 elements, each being 0 or 1.',
    },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', UserSchema);
