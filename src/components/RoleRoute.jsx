import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleRoute({ children, allowedRoles }) {
  const { userRole } = useAuth();

  if (!allowedRoles.includes(userRole)) {
    // If not authorized, kick back to dashboard (or you could show an Unauthorized component)
    return <Navigate to="/dashboard" />;
  }

  return children;
}
