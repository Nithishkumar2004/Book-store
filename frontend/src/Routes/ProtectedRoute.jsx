import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { authToken, userType } = useAuth(); // Access authToken and userType from context

  // Check if the user is authenticated and if their userType is allowed
  const hasPermission = allowedRoles ? allowedRoles.includes(userType) : true;

    
    
  // If the user is authenticated and has the required userType, render the protected route; else, redirect to login or unauthorized page
  if (authToken && hasPermission) {
    return element;
  } else {
    // Redirect to the appropriate page if authentication fails
    return <Navigate to={authToken ? "/unauthorized" : "/"} />;
  }
};

export default ProtectedRoute;
