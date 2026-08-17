const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder, 
  reorder 
} = require('../controllers/orderController');

router.use(protect);

router.route('/')
  .post(createOrder);

router.route('/my')
  .get(getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/cancel')
  .put(cancelOrder);

router.route('/:id/reorder')
  .post(reorder);

module.exports = router;
