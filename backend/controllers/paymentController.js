const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');

const generateOrderId = () => {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FR-${dateString}-${randomChars}`;
};

// @desc    Create new payment order
// @route   POST /api/payments/create-order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { restaurant, items, addressId, deliveryInstructions, couponCode } = req.body;

    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) return res.status(400).json({ success: false, message: 'Restaurant not found' });

    // Validate address
    const Address = require('../models/Address');
    const addressDoc = await Address.findById(addressId);
    if (!addressDoc) {
      return res.status(400).json({ success: false, message: 'Delivery address not found' });
    }
    if (addressDoc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Address does not belong to the user' });
    }

    const validatedItems = [];
    let itemTotal = 0;

    for (const item of items) {
      const foodDoc = await Food.findById(item.food);
      if (!foodDoc || foodDoc.restaurant.toString() !== restaurant.toString() || !foodDoc.isAvailable) {
        return res.status(400).json({ success: false, message: `Invalid or unavailable food item` });
      }

      let currentItemCustomizationTotal = 0;
      const validatedCustomizations = { spiceLevel: item.customizations?.spiceLevel || '', addOns: [] };

      if (item.customizations?.addOns && Array.isArray(item.customizations.addOns)) {
        item.customizations.addOns.forEach(addOn => {
          validatedCustomizations.addOns.push({ name: addOn.name, price: addOn.price || 0 });
          currentItemCustomizationTotal += (addOn.price || 0);
        });
      }

      const calculatedItemTotal = (foodDoc.price + currentItemCustomizationTotal) * item.quantity;
      itemTotal += calculatedItemTotal;

      validatedItems.push({
        food: foodDoc._id, name: foodDoc.name, image: foodDoc.image || '',
        price: foodDoc.price, quantity: item.quantity,
        customizations: validatedCustomizations, itemTotal: calculatedItemTotal
      });
    }

    const deliveryFee = itemTotal > 0 ? 30 : 0;
    const tax = Math.round(itemTotal * 0.05);
    let discount = 0;
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (appliedCoupon && appliedCoupon.isActive && new Date(appliedCoupon.expiryDate) > new Date() && appliedCoupon.usedCount < appliedCoupon.usageLimit) {
        if (itemTotal >= appliedCoupon.minimumOrderValue) {
          if (appliedCoupon.discountType === 'percentage') {
            discount = itemTotal * (appliedCoupon.discountValue / 100);
            if (appliedCoupon.maximumDiscount && discount > appliedCoupon.maximumDiscount) discount = appliedCoupon.maximumDiscount;
          } else {
            discount = appliedCoupon.discountValue;
          }
          if (discount > itemTotal) discount = itemTotal;
        }
      }
    }

    const total = itemTotal + deliveryFee + tax - discount;
    const amountInPaise = Math.round(total * 100);

    const razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
    });

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    const order = await Order.create({
      orderId: generateOrderId(),
      user: req.user._id,
      restaurant: restaurantDoc._id,
      restaurantSnapshot: { name: restaurantDoc.name, address: restaurantDoc.location || 'Default' },
      items: validatedItems,
      addressSnapshot: {
        name: addressDoc.name, phone: addressDoc.phone || '9999999999',
        addressLine: addressDoc.addressLine || addressDoc.house + ', ' + addressDoc.street,
        city: addressDoc.city, state: addressDoc.state, pincode: addressDoc.pincode, landmark: addressDoc.landmark || ''
      },
      bill: { itemTotal, deliveryFee, tax, discount, total },
      paymentMethod: 'Razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
      deliveryInstructions: deliveryInstructions || ''
    });

    if (appliedCoupon && discount > 0) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
        order: order
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.paidAt = new Date();
      await order.save();
      
      res.status(200).json({ success: true, message: 'Payment verified successfully', orderId: order.orderId });
    } else {
      order.paymentStatus = 'failed';
      await order.save();
      res.status(400).json({ success: false, message: 'Payment verification failed', orderId: order.orderId });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status
// @route   GET /api/payments/:orderId/status
// @access  Private
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        orderStatus: order.status
      }
    });
  } catch (error) {
    next(error);
  }
};
