import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  Home, CreateBooks, SignUp, Login, Cart, UserOrders, Profile, 
  BookDetails, InventoryManagement, SellerOrders, Dashboard, UserManagement, 
  BookManagement, SellerManagement, OrderManagement, PurchasePage,Notfound, Landingpage,SellerProfile,SellerHome
} from '../pages';
import ProtectedRoute from './ProtectedRoute';

const AllRoutes = () => {
  // Helper function to wrap protected routes for different user roles
  const protectedRoute = (element, allowedRoles) => <ProtectedRoute element={element} allowedRoles={allowedRoles} />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landingpage />} />
      <Route path="/login/:userType" element={<Login />} />
      <Route path="/signup/user" element={<SignUp userType="user" />} />
      <Route path="/signup/seller" element={<SignUp userType="seller" />} />

      {/* User Routes */}
      <Route path="/home" element={protectedRoute(<Home />, ['user', 'admin'])} />
      <Route path="/book/:id" element={protectedRoute(<BookDetails />, ['user', 'admin'])} />
      <Route path="/cart" element={protectedRoute(<Cart />, ['user'])} />
      <Route path="/orders" element={protectedRoute(<UserOrders/>, ['user'])} />
      <Route path="/user/profile" element={protectedRoute(<Profile />, ['user', 'admin'])} />
      <Route path="/purchase/:id" element={protectedRoute(<PurchasePage />, ['user', 'admin'])} />

      {/* Seller Routes */}
      <Route path="/seller/home" element={protectedRoute(<SellerHome />, ['seller', 'admin'])} />

      <Route path="/seller/profile" element={protectedRoute(<SellerProfile />, ['seller', 'admin'])} />
      
      <Route path="/books/create" element={protectedRoute(<CreateBooks />, ['seller', 'admin'])} />
      <Route path="/inventory" element={protectedRoute(<InventoryManagement />, ['seller', 'admin'])} />
      <Route path="seller/orders" element={protectedRoute(<SellerOrders />, ['seller', 'admin'])} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={protectedRoute(<Dashboard />, ['admin'])} />
      <Route path="/admin/users" element={protectedRoute(<UserManagement />, ['admin'])} />
      <Route path="/admin/books" element={protectedRoute(<BookManagement />, ['admin'])} />
      <Route path="/admin/sellers" element={protectedRoute(<SellerManagement />, ['admin'])} />
      <Route path="/admin/orders" element={protectedRoute(<OrderManagement />, ['admin'])} />

      {/* Catch-all Route for 404 */}
      <Route path="*" element={<Notfound />} />
    </Routes>
  );
};

export default AllRoutes;
