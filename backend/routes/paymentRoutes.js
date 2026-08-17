const express = require('express');
const { createOrder, verifyPayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:orderId/status', protect, getPaymentStatus);

module.exports = router;
