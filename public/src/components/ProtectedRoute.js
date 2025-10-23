import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Logged in but not authorized, redirect to home or unauthorized page
    return <Navigate to="/" replace />; // Or a specific unauthorized page
  }

  return children;
};

export default ProtectedRoute;
