const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true
    },
    discountValue: {
      type: Number,
      required: true
    },
    minimumOrderValue: {
      type: Number,
      default: 0
    },
    maximumDiscount: {
      type: Number,
      default: 0
    },
    expiryDate: {
      type: Date,
      required: true
    },
    usageLimit: {
      type: Number,
      default: 1
    },
    usedCount: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);



module.exports = mongoose.model('Coupon', couponSchema);
