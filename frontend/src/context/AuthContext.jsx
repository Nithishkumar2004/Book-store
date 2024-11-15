import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';  // Import js-cookie for cookie management

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Get authToken and userType from cookies (instead of `${Endpoint}Storage)
  const [authToken, setAuthToken] = useState(Cookies.get('authToken') || null);
  const [userType, setUserType] = useState(Cookies.get('userType') || null);

  // Check if the user is authenticated based on authToken presence
  const isAuthenticated = !!authToken;
  

  // Login function to store authToken and userType in cookies for 1 hour
  const login = ( type) => {
    setUserType(type);
    // Set cookies with 1-hour expiration
    Cookies.set('userType', type, { expires: 1  });    // 1 hour
  };

  // Logout function to remove authToken and userType from cookies
  const logout = () => {
    setAuthToken(null);
    setUserType(null);
    Cookies.remove('authToken');  // Remove token from cookies
    Cookies.remove('userType');  // Remove userType from cookies
    navigate('/');  // Navigate to home after logout
  };

  
// Optionally check for cookie on route change
useEffect(() => {
  const storedToken = Cookies.get('authToken');
  const storedUserType = Cookies.get('userType');
  
  if (storedToken && storedUserType) {
    setAuthToken(storedToken);
    setUserType(storedUserType);
  }
}, [useLocation()]);  // This will run whenever the location (URL) changes
  return (
    <AuthContext.Provider value={{ authToken, userType, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
