const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
} = require('../controllers/restaurantController');

// Public routes
router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

// Protected routes (Admin & Restaurant Owner)
router.post('/', protect, authorize('admin', 'restaurant_owner'), createRestaurant);
router.put('/:id', protect, authorize('admin', 'restaurant_owner'), updateRestaurant);

// Protected routes (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteRestaurant);

module.exports = router;
