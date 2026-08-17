const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');

// @desc    Create food
// @route   POST /api/foods
// @access  Private (Admin, Restaurant Owner)
const createFood = async (req, res, next) => {
  try {
    const {
      restaurant,
      name,
      description,
      image,
      price,
      category,
      isVeg,
      isAvailable,
      customizations
    } = req.body;

    // Validate restaurant
    const restaurantObj = await Restaurant.findById(restaurant);
    if (!restaurantObj) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Ownership check
    if (req.user.role !== 'admin' && restaurantObj.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this restaurant'
      });
    }

    const food = await Food.create({
      restaurant,
      name,
      description,
      image,
      price,
      category,
      isVeg: isVeg !== undefined ? isVeg : true,
      foodType: isVeg ? 'veg' : 'non_veg', // Maintain compatibility with older logic
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      customizations: customizations || { spiceLevels: [], addOns: [] }
    });

    res.status(201).json({
      success: true,
      message: 'Food created successfully',
      food
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get foods
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res, next) => {
  try {
    const { restaurant, category, search, isVeg, isAvailable } = req.query;

    const query = {};

    // By default, return only available food for customer queries,
    // but if requested specifically (e.g. admin), allow false.
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    } else {
      // For general public queries, usually only return available food
      query.isAvailable = true;
    }

    if (restaurant) {
      query.restaurant = restaurant;
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const foods = await Food.find(query);

    res.status(200).json({
      success: true,
      count: foods.length,
      foods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('restaurant', 'name location city isOpen');

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    res.status(200).json({
      success: true,
      food
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }
    next(error);
  }
};

// @desc    Update food
// @route   PUT /api/foods/:id
// @access  Private (Admin, Restaurant Owner)
const updateFood = async (req, res, next) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    const restaurantObj = await Restaurant.findById(food.restaurant);

    // Authorization check
    if (req.user.role !== 'admin' && restaurantObj.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prevent changing restaurant ownership via food update
    const updateData = { ...req.body };
    delete updateData.restaurant;

    // Keep foodType in sync if isVeg is updated
    if (updateData.isVeg !== undefined) {
      updateData.foodType = updateData.isVeg ? 'veg' : 'non_veg';
    }

    food = await Food.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Food updated successfully',
      food
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }
    next(error);
  }
};

// @desc    Delete food
// @route   DELETE /api/foods/:id
// @access  Private (Admin, Restaurant Owner)
const deleteFood = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }

    const restaurantObj = await Restaurant.findById(food.restaurant);

    // Authorization check
    if (req.user.role !== 'admin' && restaurantObj.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    food.isAvailable = false;
    await food.save();

    res.status(200).json({
      success: true,
      message: 'Food disabled successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Food not found'
      });
    }
    next(error);
  }
};

module.exports = {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood
};
