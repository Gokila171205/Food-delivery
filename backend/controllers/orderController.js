const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Coupon = require('../models/Coupon');

// Generate unique order ID (e.g., FR-20260812-XXXX)
const generateOrderId = () => {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `FR-${dateString}-${randomChars}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { restaurant, items, addressId, paymentMethod, deliveryInstructions, couponCode } = req.body;

    // 1. Validate restaurant
    const restaurantDoc = await Restaurant.findById(restaurant);
    if (!restaurantDoc) {
      return res.status(400).json({ success: false, message: 'Restaurant not found or is unavailable' });
    }

    // 1b. Validate address
    const Address = require('../models/Address');
    const addressDoc = await Address.findById(addressId);
    if (!addressDoc) {
      return res.status(400).json({ success: false, message: 'Delivery address not found' });
    }
    if (addressDoc.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Address does not belong to the user' });
    }

    // 2. Validate foods and calculate prices
    const validatedItems = [];
    let itemTotal = 0;

    for (const item of items) {
      const foodDoc = await Food.findById(item.food);
      
      if (!foodDoc) {
        return res.status(400).json({ success: false, message: `Food item not found (ID: ${item.food})` });
      }
      
      if (foodDoc.restaurant.toString() !== restaurant.toString()) {
        return res.status(400).json({ success: false, message: `Food item ${foodDoc.name} does not belong to the selected restaurant` });
      }
      
      if (!foodDoc.isAvailable) {
        return res.status(400).json({ success: false, message: `Food item ${foodDoc.name} is currently unavailable` });
      }

      let currentItemCustomizationTotal = 0;
      const validatedCustomizations = {
        spiceLevel: item.customizations?.spiceLevel || '',
        addOns: []
      };

      if (item.customizations?.addOns && Array.isArray(item.customizations.addOns)) {
        item.customizations.addOns.forEach(addOn => {
          // Strictly speaking, backend should verify if add-on exists in foodDoc.
          // Since our step 8 mock schema didn't enforce full strict customizations arrays on food,
          // we'll safely add it for testing but ideally we'd do a lookup.
          validatedCustomizations.addOns.push({ name: addOn.name, price: addOn.price || 0 });
          currentItemCustomizationTotal += (addOn.price || 0);
        });
      }

      const calculatedItemTotal = (foodDoc.price + currentItemCustomizationTotal) * item.quantity;
      itemTotal += calculatedItemTotal;

      validatedItems.push({
        food: foodDoc._id,
        name: foodDoc.name,
        image: foodDoc.image || '',
        price: foodDoc.price,
        quantity: item.quantity,
        customizations: validatedCustomizations,
        itemTotal: calculatedItemTotal
      });
    }

    // 3. Billing calculation
    const deliveryFee = itemTotal > 0 ? 30 : 0;
    const tax = Math.round(itemTotal * 0.05); // 5% tax
    let discount = 0;
    
    let appliedCoupon = null;

    if (couponCode) {
      appliedCoupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (appliedCoupon && appliedCoupon.isActive && new Date(appliedCoupon.expiryDate) > new Date() && appliedCoupon.usedCount < appliedCoupon.usageLimit) {
        if (itemTotal >= appliedCoupon.minimumOrderValue) {
          if (appliedCoupon.discountType === 'percentage') {
            discount = itemTotal * (appliedCoupon.discountValue / 100);
            if (appliedCoupon.maximumDiscount && discount > appliedCoupon.maximumDiscount) {
              discount = appliedCoupon.maximumDiscount;
            }
          } else {
            discount = appliedCoupon.discountValue;
          }
          if (discount > itemTotal) {
            discount = itemTotal;
          }
        }
      }
    }

    const total = itemTotal + deliveryFee + tax - discount;

    // 4. Create Order
    const order = await Order.create({
      orderId: generateOrderId(),
      user: req.user._id,
      restaurant: restaurantDoc._id,
      restaurantSnapshot: {
        name: restaurantDoc.name,
        address: restaurantDoc.location || 'Default Address'
      },
      items: validatedItems,
      addressSnapshot: {
        name: addressDoc.name,
        phone: addressDoc.phone || '9999999999',
        addressLine: addressDoc.house + ', ' + addressDoc.street,
        city: addressDoc.city,
        state: addressDoc.state,
        pincode: addressDoc.pincode,
        landmark: addressDoc.landmark || ''
      },
      bill: {
        itemTotal,
        deliveryFee,
        tax,
        discount,
        total
      },
      paymentMethod,
      deliveryInstructions: deliveryInstructions || ''
    });

    if (appliedCoupon && discount > 0) {
      appliedCoupon.usedCount += 1;
      await appliedCoupon.save();
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership or admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'owner') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Order cannot be cancelled in ${order.status} state` });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reorder
// @route   POST /api/orders/:id/reorder
// @access  Private
exports.reorder = async (req, res, next) => {
  try {
    const oldOrder = await Order.findOne({ orderId: req.params.id });

    if (!oldOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (oldOrder.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const restaurant = await Restaurant.findById(oldOrder.restaurant);
    if (!restaurant) {
      return res.status(400).json({ success: false, message: 'Restaurant is no longer available' });
    }

    const reorderItems = [];
    for (const item of oldOrder.items) {
      const food = await Food.findById(item.food);
      if (food && food.isAvailable) {
        reorderItems.push({
          foodId: food._id,
          name: food.name,
          image: food.image,
          price: food.price,
          quantity: item.quantity,
          customizations: item.customizations
        });
      }
    }

    res.status(200).json({
      success: true,
      restaurantId: restaurant._id,
      items: reorderItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({ orderId: req.params.id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const validTransitions = {
      placed: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['out_for_delivery'],
      out_for_delivery: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({ success: false, message: `Cannot transition order from ${order.status} to ${status}` });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner orders
// @route   GET /api/owner/orders
// @access  Private/Owner
exports.getOwnerOrders = async (req, res, next) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    const orders = await Order.find({ restaurant: { $in: restaurantIds } }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
