const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { 
  getOwnerOrders
} = require('../controllers/orderController');

router.use(protect);
router.use(authorize('owner'));

router.route('/')
  .get(getOwnerOrders);

module.exports = router;
