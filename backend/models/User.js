// backend/models/User.js

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  IND_ID: { type: String, unique: true },
  FullName: String,
  Event: String,
  State: String,
  Org: String,
  Phone: String,
  Email: String,
  Bio: String,
  Pic: String,
  QRCode: String,
  FoodEligibility: {
    type: [Number],
    default: Array(9).fill(0)
  }
}, { timestamps: true });

// Virtuals for 'Full Name' and 'QR code'
UserSchema.virtual('Full Name')
  .get(function() { return this.FullName; })
  .set(function(value) { this.FullName = value; });

UserSchema.virtual('QR code')
  .get(function() { return this.QRCode; })
  .set(function(value) { this.QRCode = value; });

// Virtuals for 'Food Eligibility N'
for (let i = 1; i <= 9; i++) {
  UserSchema.virtual(`Food Eligibility ${i}`)
    .get(function() { return this.FoodEligibility[i - 1]; })
    .set(function(value) { this.FoodEligibility[i - 1] = Number(value); });
}

module.exports = mongoose.model('User', UserSchema);
