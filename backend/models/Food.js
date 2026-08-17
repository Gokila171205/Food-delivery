const mongoose = require('mongoose');

const customizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 }
}, { _id: false });

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    category: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    discountPrice: Number,
    image: String,
    foodType: {
      type: String,
      enum: ['veg', 'non_veg'],
      required: true
    },
    isVeg: {
      type: Boolean,
      required: true
    },
    rating: {
      type: Number,
      default: 0
    },
    preparationTime: String,
    isAvailable: {
      type: Boolean,
      default: true
    },
    customizations: {
      spiceLevels: [customizationSchema],
      addOns: [customizationSchema]
    }
  },
  {
    timestamps: true
  }
);

foodSchema.index({ name: 1 });
foodSchema.index({ restaurant: 1 });
foodSchema.index({ category: 1 });
foodSchema.index({ isVeg: 1 });

module.exports = mongoose.model('Food', foodSchema);
