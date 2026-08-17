const Restaurant = require('../models/Restaurant');

// @desc    Create a restaurant
// @route   POST /api/restaurants
// @access  Private (Admin, Restaurant Owner)
const createRestaurant = async (req, res, next) => {
  try {
    const {
      name,
      description,
      image,
      cuisines,
      category,
      rating,
      deliveryTime,
      priceForTwo,
      location,
      address,
      city, // Fallback if city isn't provided, use location
      isOpen,
      offers
    } = req.body;

    // Use location for city if city is missing
    const resolvedCity = city || location || 'Unknown';

    const restaurant = await Restaurant.create({
      name,
      description,
      image,
      cuisines,
      category,
      rating: rating || 0,
      deliveryTime: deliveryTime || 30,
      priceForTwo: priceForTwo || 0,
      location,
      city: resolvedCity,
      address,
      isOpen: isOpen !== undefined ? isOpen : true,
      offers: offers || [],
      owner: req.user._id,
      isActive: true,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      restaurant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res, next) => {
  try {
    const { search, rating, deliveryTime, price, category, cuisine, isOpen, sort, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { cuisines: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    if (deliveryTime) {
      query.deliveryTime = { $lte: Number(deliveryTime) };
    }

    if (price) {
      query.priceForTwo = { $lte: Number(price) };
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (cuisine) {
      query.cuisines = { $regex: cuisine, $options: 'i' };
    }

    if (isOpen !== undefined) {
      query.isOpen = isOpen === 'true';
    }

    let sortOption = {};
    if (sort === 'rating') {
      sortOption.rating = -1; // Highest rated first
    } else if (sort === 'deliveryTime') {
      sortOption.deliveryTime = 1; // Fastest delivery first
    } else if (sort === 'price') {
      sortOption.priceForTwo = 1; // Lowest price first
    } else {
      sortOption.createdAt = -1; // Default
    }

    const safeLimit = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * safeLimit;

    const [restaurants, total] = await Promise.all([
      Restaurant.find(query).sort(sortOption).skip(skip).limit(safeLimit),
      Restaurant.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
      pagination: {
        page: Number(page),
        limit: safeLimit,
        total,
        pages: Math.ceil(total / safeLimit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      restaurant
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Admin, Restaurant Owner)
const updateRestaurant = async (req, res, next) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Authorization check
    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prevent changing the owner
    const updateData = { ...req.body };
    delete updateData.owner;

    restaurant = await Restaurant.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    next(error);
  }
};

// @desc    Delete restaurant (soft delete)
// @route   DELETE /api/restaurants/:id
// @access  Private (Admin)
const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Soft delete
    restaurant.isActive = false;
    restaurant.status = 'inactive';
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    next(error);
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant
};
