import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import OwnerLayout from './layouts/OwnerLayout';
import OwnerDashboard from './pages/OwnerDashboard';
import OwnerRestaurant from './pages/OwnerRestaurant';
import OwnerFoods from './pages/OwnerFoods';
import OwnerOrders from './pages/OwnerOrders';

const OwnerApp = () => {
  return (
    <OwnerLayout>
      <Routes>
        <Route path="/" element={<OwnerDashboard />} />
        <Route path="/restaurant" element={<OwnerRestaurant />} />
        <Route path="/foods" element={<OwnerFoods />} />
        <Route path="/orders" element={<OwnerOrders />} />
        <Route path="*" element={<Navigate to="/owner" replace />} />
      </Routes>
    </OwnerLayout>
  );
};

export default OwnerApp;
