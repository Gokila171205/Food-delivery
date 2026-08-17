const Favourite = require('../models/Favourite');

// @desc    Get user favourites
// @route   GET /api/favourites
// @access  Private
const getFavourites = async (req, res, next) => {
  try {
    const favourites = await Favourite.find({ user: req.user._id });
    res.status(200).json({ success: true, data: favourites });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a favourite
// @route   POST /api/favourites
// @access  Private
const addFavourite = async (req, res, next) => {
  try {
    const { restaurant } = req.body;

    if (!restaurant) {
      return res.status(400).json({ success: false, message: 'Restaurant ID is required' });
    }

    const favouriteExists = await Favourite.findOne({ user: req.user._id, restaurant });
    if (favouriteExists) {
      return res.status(400).json({ success: false, message: 'Already in favourites' });
    }

    const favourite = await Favourite.create({
      user: req.user._id,
      restaurant
    });

    res.status(201).json({ success: true, data: favourite });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a favourite
// @route   DELETE /api/favourites/:restaurantId
// @access  Private
const removeFavourite = async (req, res, next) => {
  try {
    const favourite = await Favourite.findOne({ user: req.user._id, restaurant: req.params.id });

    if (!favourite) {
      return res.status(404).json({ success: false, message: 'Favourite not found' });
    }

    await favourite.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite
};
