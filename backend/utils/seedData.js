require('dotenv').config({ override: true });
const mongoose = require('mongoose');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Find an admin user to be the owner
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Creating a dummy admin for seeding...');
      admin = await User.create({
        name: 'Seed Admin',
        email: `seedadmin${Date.now()}@example.com`,
        password: 'password123',
        phone: `${Date.now()}`.substring(0, 10),
        role: 'admin',
        isActive: true
      });
    }

    const adminId = admin._id;

    // Restaurants data
    const restaurantsData = [
      {
        name: 'Buhari Hotel',
        description: 'Popular South Indian restaurant',
        image: 'https://example.com/buhari.jpg',
        cuisines: ['Biryani', 'South Indian'],
        category: 'Indian',
        rating: 4.3,
        deliveryTime: 30,
        priceForTwo: 500,
        location: 'Anna Salai',
        city: 'Chennai',
        isOpen: true,
        owner: adminId,
        isActive: true,
        status: 'active'
      },
      {
        name: 'Pizza House',
        description: 'Best pizzas in town',
        image: 'https://example.com/pizza.jpg',
        cuisines: ['Italian', 'Pizzas'],
        category: 'Italian',
        rating: 4.5,
        deliveryTime: 40,
        priceForTwo: 800,
        location: 'T Nagar',
        city: 'Chennai',
        isOpen: true,
        owner: adminId,
        isActive: true,
        status: 'active'
      },
      {
        name: 'Anjappar',
        description: 'Authentic Chettinad Cuisine',
        image: 'https://example.com/anjappar.jpg',
        cuisines: ['Chettinad', 'South Indian'],
        category: 'Indian',
        rating: 4.2,
        deliveryTime: 35,
        priceForTwo: 600,
        location: 'Velachery',
        city: 'Chennai',
        isOpen: true,
        owner: adminId,
        isActive: true,
        status: 'active'
      },
      {
        name: 'Burger King',
        description: 'Home of the Whopper',
        image: 'https://example.com/burgerking.jpg',
        cuisines: ['Fast Food', 'Burgers'],
        category: 'Fast Food',
        rating: 4.1,
        deliveryTime: 25,
        priceForTwo: 400,
        location: 'OMR',
        city: 'Chennai',
        isOpen: true,
        owner: adminId,
        isActive: true,
        status: 'active'
      }
    ];

    console.log('Seeding restaurants...');
    const insertedRestaurants = [];
    for (const restData of restaurantsData) {
      // Upsert based on name
      const restaurant = await Restaurant.findOneAndUpdate(
        { name: restData.name },
        restData,
        { upsert: true, new: true }
      );
      insertedRestaurants.push(restaurant);
    }
    console.log('Restaurants seeded!');

    // Get IDs
    const buhari = insertedRestaurants.find(r => r.name === 'Buhari Hotel');
    const pizzaHouse = insertedRestaurants.find(r => r.name === 'Pizza House');
    const anjappar = insertedRestaurants.find(r => r.name === 'Anjappar');
    const burgerKing = insertedRestaurants.find(r => r.name === 'Burger King');

    // Foods data
    const foodsData = [
      {
        restaurant: buhari._id,
        name: 'Chicken Biryani',
        description: 'Aromatic chicken biryani',
        image: 'https://example.com/chicken_biryani.jpg',
        price: 250,
        category: 'Main Course',
        isVeg: false,
        foodType: 'non_veg',
        isAvailable: true,
        customizations: {
          spiceLevels: [{ name: 'Mild', price: 0 }, { name: 'Spicy', price: 0 }],
          addOns: [{ name: 'Extra Chicken', price: 80 }, { name: 'Raita', price: 30 }]
        }
      },
      {
        restaurant: anjappar._id,
        name: 'Mutton Biryani',
        description: 'Authentic Chettinad Mutton Biryani',
        image: 'https://example.com/mutton_biryani.jpg',
        price: 320,
        category: 'Main Course',
        isVeg: false,
        foodType: 'non_veg',
        isAvailable: true
      },
      {
        restaurant: buhari._id,
        name: 'Chicken 65',
        description: 'Spicy deep-fried chicken dish',
        image: 'https://example.com/chicken65.jpg',
        price: 180,
        category: 'Starter',
        isVeg: false,
        foodType: 'non_veg',
        isAvailable: true
      },
      {
        restaurant: pizzaHouse._id,
        name: 'Margherita Pizza',
        description: 'Classic cheese and tomato pizza',
        image: 'https://example.com/margherita.jpg',
        price: 300,
        category: 'Pizza',
        isVeg: true,
        foodType: 'veg',
        isAvailable: true
      },
      {
        restaurant: pizzaHouse._id,
        name: 'Chicken Pizza',
        description: 'Pizza topped with grilled chicken',
        image: 'https://example.com/chicken_pizza.jpg',
        price: 450,
        category: 'Pizza',
        isVeg: false,
        foodType: 'non_veg',
        isAvailable: true
      },
      {
        restaurant: burgerKing._id,
        name: 'Veg Burger',
        description: 'Crispy veg patty burger',
        image: 'https://example.com/veg_burger.jpg',
        price: 120,
        category: 'Burger',
        isVeg: true,
        foodType: 'veg',
        isAvailable: true
      },
      {
        restaurant: burgerKing._id,
        name: 'Chicken Burger',
        description: 'Juicy chicken patty burger',
        image: 'https://example.com/chicken_burger.jpg',
        price: 160,
        category: 'Burger',
        isVeg: false,
        foodType: 'non_veg',
        isAvailable: true
      }
    ];

    console.log('Seeding foods...');
    for (const foodData of foodsData) {
      // Upsert based on name and restaurant
      await Food.findOneAndUpdate(
        { name: foodData.name, restaurant: foodData.restaurant },
        foodData,
        { upsert: true, new: true }
      );
    }
    console.log('Foods seeded!');

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
