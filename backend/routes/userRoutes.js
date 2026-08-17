const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, deleteProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/me')
  .get(protect, getProfile)
  .put(protect, updateProfile)
  .delete(protect, deleteProfile);

module.exports = router;
