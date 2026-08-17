const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  getOwnerDashboardStats,
  getOwnerRestaurant, updateOwnerRestaurant,
  getOwnerFoods, createOwnerFood, updateOwnerFood, deleteOwnerFood,
  getOwnerOrders, updateOwnerOrderStatus
} = require('../controllers/ownerController');

router.use(protect);
router.use(authorize('restaurant_owner', 'owner')); // Allowing both string conventions just in case

// Dashboard
router.get('/dashboard', getOwnerDashboardStats);

// Restaurant
router.route('/restaurant')
  .get(getOwnerRestaurant)
  .put(updateOwnerRestaurant);

// Foods
router.route('/foods')
  .get(getOwnerFoods)
  .post(createOwnerFood);
router.route('/foods/:id')
  .put(updateOwnerFood)
  .delete(deleteOwnerFood);

// Orders
router.route('/orders')
  .get(getOwnerOrders);
router.route('/orders/:id/status')
  .put(updateOwnerOrderStatus);

module.exports = router;
