const express = require('express');
const router = express.Router();
const { getFavourites, addFavourite, removeFavourite } = require('../controllers/favouriteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFavourites)
  .post(protect, addFavourite);

router.route('/:id')
  .delete(protect, removeFavourite);

module.exports = router;
