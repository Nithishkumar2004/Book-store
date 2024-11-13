import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Warning from '../components/Warning';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { authToken, userType } = useAuth(); // Access authToken and userType from context

  // Check if the user is authenticated and if their userType is allowed
  const hasPermission = allowedRoles ? allowedRoles.includes(userType) : true;

  // If the user is authenticated and has the required userType, render the protected route; else, show the warning modal and redirect
  if (authToken && hasPermission) {
    return element;
  } else {
    return <Warning />;
  }
};

export default ProtectedRoute;
