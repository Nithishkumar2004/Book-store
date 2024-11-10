import React, { useState, useEffect } from 'react';
import AllRoutes from './Routes/AllRoutes';
import Header from './components/Header';
import { AuthProvider, useAuth } from './context/AuthContext';

const App = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

const AuthenticatedApp = () => {
  const { isAuthenticated, userType } = useAuth();  // Getting the auth status and user type
  const [menuItems, setMenuItems] = useState([]);

  // Define the default menu items for all users
  const defaultMenuItems = [
    { name: 'user', href: '/login/user' },
    { name: 'seller', href: '/login/seller' },
    { name: 'admin', href: '/login/admin' }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      if (userType === 'user') {
        setMenuItems([
          { name: 'Home', href: '/home' },
          { name: 'Profile', href: 'user/profile' },
          { name: 'Cart', href: '/cart' },
          { name: 'Checkout', href: '/checkout' },
          { name: 'Feedback', href: '/feedback' },
        ]);
      } else if (userType === 'seller') {
        setMenuItems([
          { name: 'Seller Home', href: '/seller/home' },
          { name: 'Create Book', href: '/books/create' },
          { name: 'Inventory', href: '/inventory' },
          { name: 'Orders', href: '/orders' },
        ]);
      } else if (userType === 'admin') {
        setMenuItems([
          { name: 'Dashboard', href: '/admin/dashboard' },
          { name: 'User Management', href: '/admin/users' },
          { name: 'Book Management', href: '/admin/books' },
          { name: 'Seller Management', href: '/admin/sellers' },
          { name: 'System Settings', href: '/admin/settings' },
        ]);
      }
    } else {
      setMenuItems(defaultMenuItems);
    }
  }, [isAuthenticated, userType]); // Update menuItems when auth status or userType changes

  return (
    <>
      <Header menuItems={menuItems} />
      <AllRoutes />
    </>
  );
};

export default App;
