# 🍔 FoodRush – Food Delivery Application

FoodRush is a full-stack food delivery web application that provides a complete online food ordering experience for customers while also providing dedicated management dashboards for restaurant owners and administrators.

The application includes user authentication, restaurant and food browsing, cart management, favourites, address management, coupons, order placement, payment handling, order tracking, and role-based admin/owner management.

## 🚀 Features

### 👤 Customer Features

* User registration and login
* JWT-based authentication
* Browse restaurants
* Browse food items
* Search for restaurants and food
* Food categories
* Food customization
* Add items to cart
* Same-restaurant cart validation
* Update cart quantities
* Remove items from cart
* Add/remove favourite foods
* Manage delivery addresses
* Apply coupons
* Checkout and order placement
* Payment processing
* Order history
* Order details
* Order status tracking
* User profile management
* Account settings

### 🏪 Restaurant Owner Features

* Owner authentication
* Owner dashboard
* Manage restaurant information
* Manage food items
* Add new food items
* Update food items
* Delete food items
* View restaurant orders
* Manage order status
* View restaurant-related information

### 🛡️ Admin Features

* Admin authentication
* Admin dashboard
* Manage users
* Manage restaurants
* Manage food items
* Manage coupons
* View and manage orders
* Monitor application data
* Role-based access control

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* Tailwind CSS
* Axios
* React Router
* Context API

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* REST APIs

### Development Tools

* Git
* GitHub
* VS Code
* Postman

## 📁 Project Structure

```text
Food-delivery/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── addressController.js
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── couponController.js
│   │   ├── favouriteController.js
│   │   ├── foodController.js
│   │   ├── orderController.js
│   │   ├── ownerController.js
│   │   ├── paymentController.js
│   │   ├── restaurantController.js
│   │   └── userController.js
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   ├── notFound.js
│   │   └── roleMiddleware.js
│   │
│   ├── models/
│   │   ├── Address.js
│   │   ├── Cart.js
│   │   ├── Coupon.js
│   │   ├── Favourite.js
│   │   ├── Food.js
│   │   ├── Order.js
│   │   ├── Restaurant.js
│   │   └── User.js
│   │
│   ├── routes/
│   │   ├── addressRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── couponRoutes.js
│   │   ├── favouriteRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── ownerRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── restaurantRoutes.js
│   │
│   ├── utils/
│   │   ├── seedAdmin.js
│   │   └── seedData.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── public/
│
├── src/
│   ├── admin/
│   │   ├── layouts/
│   │   └── pages/
│   │
│   ├── owner/
│   │   ├── layouts/
│   │   └── pages/
│   │
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── layouts/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── main.jsx
│
├── .gitignore
├── package.json
├── README.md
└── vite.config.js
```

## 🔐 Authentication & Authorization

FoodRush uses JWT-based authentication for securing user accounts and protected APIs.

Passwords are securely hashed using bcrypt.

The application supports role-based access:

```text
Customer
   │
   ├── Browse restaurants
   ├── Order food
   ├── Manage cart
   └── Manage profile
   │
Owner
   │
   ├── Manage restaurant
   ├── Manage foods
   └── Manage orders
   │
Admin
   │
   ├── Manage users
   ├── Manage restaurants
   ├── Manage foods
   ├── Manage coupons
   └── Manage orders
```

Protected routes ensure that users can access only the functionality allowed for their role.

## 🗄️ Database

FoodRush uses **MongoDB** with **Mongoose** for database management.

Main collections/models include:

* User
* Restaurant
* Food
* Cart
* Favourite
* Address
* Order
* Coupon

## ⚙️ Environment Variables

Create an environment file for the backend.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

For the frontend:

```env
VITE_API_URL=http://localhost:5000/api
```

> **Important:** Never commit `.env` files or database credentials to GitHub. Use `.env.example` to document required environment variables.

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Gokila171205/Food-delivery.git
cd Food-delivery
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Create the required `.env` files based on `.env.example`.

### 5. Start the Backend

From the `backend` directory:

```bash
npm start
```

The backend will run on:

```text
http://localhost:5000
```

### 6. Start the Frontend

Open another terminal in the project root:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

## 🔄 Application Flow

```text
User
 │
 ▼
Frontend (React + Vite)
 │
 ▼
Axios API Requests
 │
 ▼
Express.js REST API
 │
 ├── Authentication
 ├── Users
 ├── Restaurants
 ├── Foods
 ├── Cart
 ├── Favourites
 ├── Addresses
 ├── Coupons
 ├── Orders
 └── Payments
 │
 ▼
MongoDB
```

## 🛒 Food Ordering Flow

```text
Browse Restaurants
        ↓
Select Restaurant
        ↓
View Food Items
        ↓
Customize Food
        ↓
Add to Cart
        ↓
Review Cart
        ↓
Select Address
        ↓
Apply Coupon
        ↓
Checkout
        ↓
Payment
        ↓
Place Order
        ↓
Track Order
```

## 🔒 Security

The application implements several security practices:

* JWT authentication
* Password hashing with bcrypt
* Protected API routes
* Role-based authorization
* Environment variables for secrets
* Backend validation
* Authentication middleware
* Restricted admin and owner routes

## 🧪 API Testing

The backend REST APIs can be tested using Postman.

Example API categories:

```text
/api/auth
/api/users
/api/restaurants
/api/foods
/api/cart
/api/favourites
/api/addresses
/api/coupons
/api/orders
/api/payments
/api/admin
/api/owner
```

## 📊 Key Modules

| Module         | Description                            |
| -------------- | -------------------------------------- |
| Authentication | Login, signup and JWT authentication   |
| Restaurants    | Restaurant browsing and management     |
| Food           | Food item management and customization |
| Cart           | Add, update and remove food items      |
| Favourites     | Save favourite food items              |
| Address        | Manage delivery addresses              |
| Coupons        | Apply discount coupons                 |
| Orders         | Place and manage orders                |
| Payments       | Handle payment workflow                |
| Admin          | Application-wide management            |
| Owner          | Restaurant-specific management         |

## 🎯 Project Objective

The main objective of FoodRush is to build a complete, scalable food delivery platform that connects customers, restaurant owners, and administrators through a single application.

The project demonstrates practical implementation of:

* Full-stack web development
* REST API development
* MongoDB database design
* Authentication and authorization
* Role-based access control
* State management
* CRUD operations
* Payment workflow
* Admin dashboards
* Restaurant management
* Real-world application architecture

## 🔮 Future Improvements

* Real-time order tracking
* Live delivery partner tracking
* Push notifications
* Restaurant ratings and reviews
* Delivery partner module
* Advanced recommendation system
* Online payment gateway integration
* Real-time order status using WebSockets
* Analytics and sales reports
* Cloud deployment
* Image storage using cloud services

## 👩‍💻 Author

**Gokila P.**

B.E. Computer Science and Engineering

Sri Sairam Institute of Technology

---

⭐ If you find this project useful, consider giving the repository a star!

