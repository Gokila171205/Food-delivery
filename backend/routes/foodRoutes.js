const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood
} = require('../controllers/foodController');

// Public routes
router.get('/', getFoods);
router.get('/:id', getFoodById);

// Protected routes (Admin & Restaurant Owner)
router.post('/', protect, authorize('admin', 'restaurant_owner'), createFood);
router.put('/:id', protect, authorize('admin', 'restaurant_owner'), updateFood);
router.delete('/:id', protect, authorize('admin', 'restaurant_owner'), deleteFood);

module.exports = router;
