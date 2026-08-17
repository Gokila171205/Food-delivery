const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getDashboardStats,
  getUsers, updateUser, deleteUser,
  getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant,
  getFoods, createFood, updateFood, deleteFood,
  getOrders, updateOrderStatus,
  getCoupons, createCoupon, updateCoupon, deleteCoupon
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.route('/users')
  .get(getUsers);
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);

// Restaurants
router.route('/restaurants')
  .get(getRestaurants)
  .post(createRestaurant);
router.route('/restaurants/:id')
  .put(updateRestaurant)
  .delete(deleteRestaurant);

// Foods
router.route('/foods')
  .get(getFoods)
  .post(createFood);
router.route('/foods/:id')
  .put(updateFood)
  .delete(deleteFood);

// Orders
router.route('/orders')
  .get(getOrders);
router.route('/orders/:id/status')
  .put(updateOrderStatus);

// Coupons
router.route('/coupons')
  .get(getCoupons)
  .post(createCoupon);
router.route('/coupons/:id')
  .put(updateCoupon)
  .delete(deleteCoupon);

module.exports = router;
