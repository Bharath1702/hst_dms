// backend/routes/couponValidityRoutes.js

const express = require('express');
const router = express.Router();
const CouponValidity = require('../models/CouponValidity');

// Helper function to parse date strings as local time
const parseDateStringAsLocal = (dateString) => {
  if (!dateString) return null;
  const [datePart, timePart] = dateString.split('T');
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split('-').map((s) => parseInt(s, 10));
  const [hour, minute] = timePart.split(':').map((s) => parseInt(s, 10));
  return new Date(year, month - 1, day, hour, minute);
};

// Helper function to format Date object to 'YYYY-MM-DDTHH:MM' for datetime-local input
const formatDateTimeLocal = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return '';
  const pad = (num) => (num < 10 ? '0' + num : num);
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// GET /api/coupon-validities
router.get('/coupon-validities', async (req, res) => {
  try {
    const couponValidities = await CouponValidity.find().sort({ couponIndex: 1 });
    res.json(couponValidities);
  } catch (error) {
    console.error('Error fetching coupon validities:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/coupon-validities
router.post('/coupon-validities', async (req, res) => {
  try {
    console.log('POST /api/coupon-validities - Body:', req.body);
    const { couponIndex, startDateTime, endDateTime } = req.body;

    if (
      couponIndex === undefined ||
      !startDateTime ||
      !endDateTime ||
      isNaN(couponIndex)
    ) {
      return res.status(400).json({
        message: 'couponIndex (number), startDateTime, and endDateTime are required.',
      });
    }

    const existingCoupon = await CouponValidity.findOne({ couponIndex });
    if (existingCoupon) {
      return res.status(400).json({
        message: `Coupon Validity for couponIndex ${couponIndex} already exists.`,
      });
    }

    const parsedStartDate = parseDateStringAsLocal(startDateTime);
    const parsedEndDate = parseDateStringAsLocal(endDateTime);

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({
        message: 'Invalid date format.',
      });
    }

    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({
        message: 'startDateTime must be earlier than endDateTime.',
      });
    }

    const validity = new CouponValidity({
      couponIndex,
      startDateTime: parsedStartDate,
      endDateTime: parsedEndDate,
    });

    await validity.save();
    res.status(201).json(validity);
  } catch (error) {
    console.error('Error creating coupon validity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/coupon-validities/:id
router.put('/coupon-validities/:id', async (req, res) => {
  try {
    console.log(`PUT /api/coupon-validities/${req.params.id} - Body:`, req.body);
    const { id } = req.params;
    const { couponIndex, startDateTime, endDateTime } = req.body;

    if (
      couponIndex === undefined ||
      !startDateTime ||
      !endDateTime ||
      isNaN(couponIndex)
    ) {
      return res.status(400).json({
        message: 'couponIndex (number), startDateTime, and endDateTime are required.',
      });
    }

    const parsedStartDate = parseDateStringAsLocal(startDateTime);
    const parsedEndDate = parseDateStringAsLocal(endDateTime);

    if (!parsedStartDate || !parsedEndDate) {
      return res.status(400).json({
        message: 'Invalid date format.',
      });
    }

    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({
        message: 'startDateTime must be earlier than endDateTime.',
      });
    }

    const existingCoupon = await CouponValidity.findOne({
      couponIndex,
      _id: { $ne: id },
    });
    if (existingCoupon) {
      return res.status(400).json({
        message: `Another Coupon Validity for couponIndex ${couponIndex} already exists.`,
      });
    }

    const updatedValidity = await CouponValidity.findByIdAndUpdate(
      id,
      {
        couponIndex,
        startDateTime: parsedStartDate,
        endDateTime: parsedEndDate,
      },
      { new: true, runValidators: true }
    );

    if (!updatedValidity) {
      return res.status(404).json({ message: 'Coupon Validity not found.' });
    }

    res.json(updatedValidity);
  } catch (error) {
    console.error('Error updating coupon validity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/coupon-validities/:id
router.delete('/coupon-validities/:id', async (req, res) => {
  try {
    console.log(`DELETE /api/coupon-validities/${req.params.id}`);
    const { id } = req.params;
    const validity = await CouponValidity.findByIdAndDelete(id);

    if (!validity) {
      return res.status(404).json({ message: 'Coupon Validity not found.' });
    }

    res.json({ message: 'Coupon Validity deleted successfully.' });
  } catch (error) {
    console.error('Error deleting coupon validity:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
