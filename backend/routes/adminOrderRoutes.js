const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { 
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getAllOrders);

router.route('/:id/status')
  .put(updateOrderStatus);

module.exports = router;
