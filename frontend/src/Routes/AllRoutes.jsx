import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  Home, CreateBooks, EditBook, SignUp, DeleteBook, Login, Cart, Checkout, Profile, 
  BookDetails, Feedback, InventoryManagement, Orders, Dashboard, UserManagement, 
  BookManagement, SellerManagement, SystemSettings, Notfound, Landingpage,SellerProfile
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
      <Route path="/home" element={protectedRoute(<Home />, ['user', 'seller', 'admin'])} />
      <Route path="/book/:id" element={protectedRoute(<BookDetails />, ['user', 'seller', 'admin'])} />
      <Route path="/cart" element={protectedRoute(<Cart />, ['user'])} />
      <Route path="/checkout" element={protectedRoute(<Checkout />, ['user'])} />
      <Route path="/user/profile" element={protectedRoute(<Profile />, ['user', 'seller', 'admin'])} />
      <Route path="/feedback" element={protectedRoute(<Feedback />, ['user', 'seller', 'admin'])} />

      {/* Seller Routes */}
      <Route path="/seller/home" element={protectedRoute(<Home />, ['seller', 'admin'])} />

      <Route path="/seller/profile" element={protectedRoute(<SellerProfile />, ['seller', 'admin'])} />
      
      <Route path="/books/create" element={protectedRoute(<CreateBooks />, ['seller', 'admin'])} />
      <Route path="/books/edit/:id" element={protectedRoute(<EditBook />, ['seller', 'admin'])} />
      <Route path="/books/delete/:id" element={protectedRoute(<DeleteBook />, ['seller', 'admin'])} />
      <Route path="/inventory" element={protectedRoute(<InventoryManagement />, ['seller', 'admin'])} />
      <Route path="/orders" element={protectedRoute(<Orders />, ['seller', 'admin'])} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={protectedRoute(<Dashboard />, ['admin'])} />
      <Route path="/admin/users" element={protectedRoute(<UserManagement />, ['admin'])} />
      <Route path="/admin/books" element={protectedRoute(<BookManagement />, ['admin'])} />
      <Route path="/admin/sellers" element={protectedRoute(<SellerManagement />, ['admin'])} />
      <Route path="/admin/settings" element={protectedRoute(<SystemSettings />, ['admin'])} />

      {/* Catch-all Route for 404 */}
      <Route path="*" element={<Notfound />} />
    </Routes>
  );
};

export default AllRoutes;
