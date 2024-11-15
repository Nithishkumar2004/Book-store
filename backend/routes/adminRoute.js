

import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Initialize environment variables
dotenv.config();
const router = express.Router();

router.use(cookieParser());


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

    res.cookie('token', token, {
        httpOnly: false, 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000, // 1 hour
      });
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
