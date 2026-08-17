import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loadingUser } = useAppContext();

  if (loadingUser) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">Loading...</div>;
  }

  if (!user) {
    if (allowedRoles && allowedRoles.includes('admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const role = user.role === 'restaurant_owner' ? 'owner' : user.role;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'owner') return <Navigate to="/owner" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
