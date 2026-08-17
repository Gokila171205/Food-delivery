const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    restaurant: {
      type: String, // String because frontend uses string IDs for mock data currently
      required: true
    }
  },
  {
    timestamps: true
  }
);

favouriteSchema.index({ user: 1, restaurant: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
