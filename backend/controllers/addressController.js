const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user: req.user._id });
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
const addAddress = async (req, res, next) => {
  try {
    let { type, name, phone, house, street, city, state, pincode, landmark, isDefault } = req.body;
    
    type = type ? type.toLowerCase() : 'home';

    // Unset other defaults if this is marked as default
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      user: req.user._id,
      type,
      name,
      phone,
      house,
      street,
      city,
      state,
      pincode,
      landmark,
      isDefault
    });

    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res, next) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Ensure the address belongs to the user
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this address' });
    }

    if (req.body.type) {
      req.body.type = req.body.type.toLowerCase();
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Ensure the address belongs to the user
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this address' });
    }

    await Address.deleteOne({ _id: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this address' });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    
    address.isDefault = true;
    await address.save();

    res.status(200).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
