const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true
  },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  customizations: {
    spiceLevel: String,
    addOns: [
      {
        name: String,
        price: Number
      }
    ]
  },
  itemTotal: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true
    },
    restaurantSnapshot: {
      name: { type: String, required: true },
      address: { type: String }
    },
    items: [orderItemSchema],
    addressSnapshot: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      addressLine: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String }
    },
    bill: {
      itemTotal: { type: Number, required: true },
      deliveryFee: { type: Number, required: true },
      tax: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true }
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    paidAt: Date,
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed'
    },
    deliveryInstructions: String
  },
  {
    timestamps: true
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ restaurant: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
