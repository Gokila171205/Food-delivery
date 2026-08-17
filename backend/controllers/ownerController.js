const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');

// Get Owner's Restaurant ID Helper
const getOwnerRestaurantId = async (ownerId) => {
  const restaurant = await Restaurant.findOne({ owner: ownerId });
  return restaurant ? restaurant._id : null;
};

// Dashboard Data
const getOwnerDashboardStats = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user._id);
    if (!restaurantId) {
      return res.status(200).json({ success: true, data: { error: 'No restaurant found for this owner.' } });
    }

    const [
      totalFoods,
      orderStats,
      recentOrders
    ] = await Promise.all([
      Food.countDocuments({ restaurant: restaurantId }),
      Order.aggregate([
        { $match: { restaurant: restaurantId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            revenue: { $sum: { $cond: [{ $in: ["$status", ["delivered", "placed", "confirmed", "preparing", "out_for_delivery"]] }, "$bill.total", 0] } }
          }
        }
      ]),
      Order.find({ restaurant: restaurantId }).sort({ createdAt: -1 }).limit(10).populate('user', 'name')
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
        totalFoods,
        totalOrders: Object.values(statsObj).reduce((a, b) => a + b, 0),
        totalRevenue: Math.round(totalRevenue),
        orderStatusCounts: statsObj,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Restaurant Management
const getOwnerRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateOwnerRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      { owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!restaurant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.status(200).json({ success: true, data: restaurant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Food Management
const getOwnerFoods = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user._id);
    if (!restaurantId) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const foods = await Food.find({ restaurant: restaurantId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createOwnerFood = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user._id);
    if (!restaurantId) return res.status(400).json({ success: false, message: 'Must create a restaurant first' });

    const foodData = { ...req.body, restaurant: restaurantId };
    const food = await Food.create(foodData);
    res.status(201).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

const updateOwnerFood = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user._id);
    const food = await Food.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!food) return res.status(404).json({ success: false, message: 'Food not found or unauthorized' });
    res.status(200).json({ success: true, data: food });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteOwnerFood = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user._id);
    const food = await Food.findOneAndDelete({ _id: req.params.id, restaurant: restaurantId });
    if (!food) return res.status(404).json({ success: false, message: 'Food not found or unauthorized' });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Order Management
const getOwnerOrders = async (req, res) => {
  try {
    const restaurantId = await getOwnerRestaurantId(req.user._id);
    if (!restaurantId) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const orders = await Order.find({ restaurant: restaurantId }).populate('user', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateOwnerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const restaurantId = await getOwnerRestaurantId(req.user._id);
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
    
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getOwnerDashboardStats,
  getOwnerRestaurant, updateOwnerRestaurant,
  getOwnerFoods, createOwnerFood, updateOwnerFood, deleteOwnerFood,
  getOwnerOrders, updateOwnerOrderStatus
};
