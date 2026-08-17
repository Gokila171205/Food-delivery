const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

// Dashboard Data
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalRestaurants,
      totalFoods,
      totalOrders,
      orderStats,
      recentOrders
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Restaurant.countDocuments(),
      Food.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $in: ["$status", ["delivered", "placed", "confirmed", "preparing", "out_for_delivery"]] }, "$bill.total", 0] } }
          }
        }
      ]),
      Order.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name').populate('restaurant', 'name')
    ]);

    let totalRevenue = 0;
    const statsObj = { placed: 0, confirmed: 0, preparing: 0, out_for_delivery: 0, delivered: 0, cancelled: 0 };

    orderStats.forEach(stat => {
      if (statsObj[stat._id] !== undefined) {
        statsObj[stat._id] = stat.count;
      }
      totalRevenue += stat.revenue || 0;
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRestaurants,
        totalFoods,
        totalOrders,
        totalRevenue: Math.round(totalRevenue),
        orderStatusCounts: statsObj,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Prevent accidental admin demotion if it's the current admin
    if (user._id.toString() === req.user._id.toString() && req.body.role && req.body.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot demote yourself' });
    }

    const updated = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete yourself' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Restaurants
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Foods
const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().populate('restaurant', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createFood = async (req, res) => {
  try {
    const food = await Food.create(req.body);
    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
    res.status(200).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ success: false, message: 'Food not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').populate('restaurant', 'name').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Coupons
const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: coupons.length, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, data: coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getDashboardStats,
  getUsers, updateUser, deleteUser,
  getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant,
  getFoods, createFood, updateFood, deleteFood,
  getOrders, updateOrderStatus,
  getCoupons, createCoupon, updateCoupon, deleteCoupon
};
