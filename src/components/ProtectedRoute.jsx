import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = ({ children }) => {
  const { user, loadingUser } = useAppContext();
  const location = useLocation();

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  if (user.role === 'owner' || user.role === 'restaurant_owner') {
    return <Navigate to="/owner" replace />;
  }

  return children;
};

export default ProtectedRoute;
