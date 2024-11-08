import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use Auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component to wrap the app and provide auth state
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();  // Move useNavigate inside the component

  // Get authToken and userType from localStorage
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [userType, setUserType] = useState(localStorage.getItem('userType'));

  // Check if the user is authenticated based on authToken presence
  const isAuthenticated = !!authToken;

  // Login function to store authToken and userType
  const login = (token, type) => {
    setAuthToken(token);
    setUserType(type);
    localStorage.setItem('authToken', token); // Persist token in localStorage
    localStorage.setItem('userType', type); // Persist userType in localStorage
  };

  // Logout function to remove authToken and userType
  const logout = () => {
    setAuthToken(null);
    setUserType(null);
    localStorage.removeItem('authToken'); // Remove token from localStorage
    localStorage.removeItem('userType'); // Remove userType from localStorage
    navigate('/'); // Navigate to home after logout
  };

  useEffect(() => {
    // Load authToken and userType from localStorage on component mount (initial load)
    const storedToken = localStorage.getItem('authToken');
    const storedUserType = localStorage.getItem('userType');
    if (storedToken && storedUserType) {
      setAuthToken(storedToken);
      setUserType(storedUserType);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, userType, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
