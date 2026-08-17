require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD } = process.env;

    if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PHONE || !ADMIN_PASSWORD) {
      console.error('Please provide ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD in .env');
      process.exit(1);
    }

    const adminExists = await User.findOne({ 
      $or: [{ email: ADMIN_EMAIL }, { phone: ADMIN_PHONE }, { role: 'admin' }] 
    });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

    if (adminExists) {
      console.log('Admin user already exists. Updating credentials...');
      adminExists.name = ADMIN_NAME;
      adminExists.email = ADMIN_EMAIL;
      adminExists.phone = ADMIN_PHONE;
      adminExists.password = hashedPassword;
      await adminExists.save();
      console.log('Admin user updated successfully');
      process.exit(0);
    }

    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      phone: ADMIN_PHONE,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
