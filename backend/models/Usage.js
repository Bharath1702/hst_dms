// backend/models/Usage.js

const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  IND_ID: { type: String, required: true },
  couponIndex: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  mealCategory: { type: String, required: true }
});

module.exports = mongoose.model('Usage', UsageSchema);
