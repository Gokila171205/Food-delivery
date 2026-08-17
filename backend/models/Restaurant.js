const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cuisines: [String],
    address: String,
    city: {
      type: String,
      required: true,
      trim: true
    },
    phone: String,
    email: String,
    openingTime: String,
    closingTime: String,
    deliveryTime: Number,
    priceForTwo: Number,
    category: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    offers: [Object],
    isOpen: {
      type: Boolean,
      default: true
    },
    image: String,
    rating: {
      type: Number,
      default: 0
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'suspended'],
      default: 'pending'
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

restaurantSchema.index({ name: 1 });
restaurantSchema.index({ city: 1 });
restaurantSchema.index({ category: 1 });
restaurantSchema.index({ location: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);
