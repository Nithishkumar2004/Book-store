

import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { User } from '../models/userModel.js';
import { Seller } from '../models/sellerModel.js';

// Initialize environment variables
dotenv.config();
const router = express.Router();

// Helper function to send errors
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ success: false, message });
};


router.use(cookieParser());

// Fetch all users
router.get('/users', async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find().select('-password'); // Exclude password from the result
    console.log(users);
    
    if (!users) {
      return sendErrorResponse(res, 404, 'No users found');
    }

    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});


// Fetch all sellers
router.get('/sellers', async (req, res) => {
  try {
    // Fetch all sellers
    const sellers = await Seller.find().select('-password'); // Exclude password from the result
    console.log(sellers);
    
    if (!sellers || sellers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No sellers found'
      });
    }

    res.status(200).json({
      success: true,
      sellers,
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});




// Hardcoded credentials (not recommended for production)
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin'; // This should be hashed in real applications

// Admin login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    
    // Check if username and password match the hardcoded credentials
    if (email !== ADMIN_USERNAME) {
   return res.status(400).json({ message: 'Invalid username' });
    }

    // In a real-world scenario, the password should be hashed and verified using bcrypt
    if (password !== ADMIN_PASSWORD) {

      return res.status(400).json({ message: 'Invalid password' });
    }


    // Generate a JWT token
    const token = jwt.sign(
      { email: ADMIN_USERNAME, userType: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );



    res.cookie('authToken', token, {
        httpOnly: false, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
      });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


export default router;
