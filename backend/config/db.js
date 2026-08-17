const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI environment variable is not defined");
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    // Basic sanitization of error message to remove potential credentials
    const cleanMessage = error.message.replace(/mongodb(?:\+srv)?:\/\/[^@]+@/, 'mongodb://***:***@');
    console.error(`MongoDB connection failed: ${cleanMessage}`);
    process.exit(1);
  }
};

module.exports = connectDB;
