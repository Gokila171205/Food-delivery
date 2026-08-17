import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import FavouritesPage from './pages/FavouritesPage';
import AddressesPage from './pages/AddressesPage';
import SettingsPage from './pages/SettingsPage';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import { AppProvider } from './context/AppContext';
import './index.css';

// Lazy load admin and owner apps to keep main bundle clean, or standard import if small enough.
import AdminApp from './admin/AdminApp';
import OwnerApp from './owner/OwnerApp';
import AdminLoginPage from './admin/pages/AdminLoginPage';

function App() {
  return (
    <AppProvider>
      <Router>
          <Routes>
            {/* --- ADMIN APP --- */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/*" element={
              <RoleRoute allowedRoles={['admin']}>
                <AdminApp />
              </RoleRoute>
            } />

            {/* --- OWNER APP --- */}
            <Route path="/owner/*" element={
              <RoleRoute allowedRoles={['owner', 'restaurant_owner']}>
                <OwnerApp />
              </RoleRoute>
            } />

            {/* --- CUSTOMER APP --- */}
            <Route path="*" element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/restaurants" element={<RestaurantsPage />} />
                  <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                  <Route path="/order-success" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
                  
                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  
                  {/* Account Protected Routes */}
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
                  <Route path="/favourites" element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
                  <Route path="/addresses" element={<ProtectedRoute><AddressesPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                </Routes>
                <CartDrawer />
              </MainLayout>
            } />
          </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
