import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminRestaurants from './pages/AdminRestaurants';
import AdminFoods from './pages/AdminFoods';
import AdminOrders from './pages/AdminOrders';
import AdminCoupons from './pages/AdminCoupons';

const AdminApp = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/restaurants" element={<AdminRestaurants />} />
        <Route path="/foods" element={<AdminFoods />} />
        <Route path="/orders" element={<AdminOrders />} />
        <Route path="/coupons" element={<AdminCoupons />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;
