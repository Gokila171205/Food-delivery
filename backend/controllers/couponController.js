const Coupon = require('../models/Coupon');
const Food = require('../models/Food');

// @desc    Get valid active coupons
// @route   GET /api/coupons
// @access  Private
exports.getValidCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    // We can also filter out coupons where usageLimit <= usedCount
    const validCoupons = coupons.filter(c => c.usageLimit > c.usedCount);

    res.status(200).json({
      success: true,
      count: validCoupons.length,
      data: validCoupons
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate coupon against cart
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, cart } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ success: false, message: 'This coupon is inactive' });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This coupon has expired' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    }

    // Securely calculate subtotal from backend database
    let subtotal = 0;
    for (const item of cart) {
      // Expect item to have foodId, quantity, selectedCustomizations
      const foodDoc = await Food.findById(item.foodId || item.food);
      if (!foodDoc) {
        return res.status(404).json({ success: false, message: `Food item not found (ID: ${item.foodId || item.food})` });
      }

      let currentItemCustomizationTotal = 0;
      if (item.selectedCustomizations?.addOns && Array.isArray(item.selectedCustomizations.addOns)) {
        item.selectedCustomizations.addOns.forEach(addOn => {
           // We just trust the addOn price structure from step 8, but ideally query nested objects
           currentItemCustomizationTotal += (addOn.price || 0);
        });
      }
      
      subtotal += (foodDoc.price + currentItemCustomizationTotal) * item.quantity;
    }

    if (subtotal < coupon.minimumOrderValue) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum order value of ₹${coupon.minimumOrderValue} required for this coupon` 
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = subtotal * (coupon.discountValue / 100);
      if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
        discount = coupon.maximumDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed subtotal
    if (discount > subtotal) {
      discount = subtotal;
    }

    const deliveryFee = subtotal > 0 ? 30 : 0;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + deliveryFee + tax - discount;

    res.status(200).json({
      success: true,
      data: {
        coupon,
        bill: {
          subtotal,
          deliveryFee,
          tax,
          discount: Math.round(discount),
          total: Math.round(total)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
