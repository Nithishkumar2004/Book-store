import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator'; // For request validation
import cookieParser from 'cookie-parser';

dotenv.config(); // Load environment variables from .env

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h'; // Default expiry is 1 hour if not set

// Middleware to use cookies
router.use(cookieParser());

// Helper function to send errors
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ success: false, message });
};




// Register Route for User
router.post('/register',
  [
    // Input validation using express-validator
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('phone').isNumeric().withMessage('Phone number must be numeric'),
    check('pincode').isNumeric().withMessage('Pincode must be numeric'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, errors.array().map(err => err.msg).join(', '));
    }

    const { name, email, password, phone, gender, age, favorites, address, pincode } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return sendErrorResponse(res, 400, 'User already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        gender,
        age,
        favorites,
        address,
        pincode,
      });

      await newUser.save();

      // Exclude password from the response
      const { password: _, ...userWithoutPassword } = newUser.toObject();

      res.status(201).json({ success: true, message: 'Registration successful', user: userWithoutPassword });
    } catch (error) {
      console.error('Error registering user:', error);
      sendErrorResponse(res, 500, 'Server error');
    }
  }
);

// Login Route for User
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
   
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY || '1h' });

    // Exclude password from user data
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Send token as a cookie
    res.cookie('authToken', token, {
      httpOnly: false, // Prevents client-side JS from accessing the token for security
      secure: process.env.NODE_ENV === 'production', // Ensures HTTPS only in production
      maxAge: JWT_EXPIRY, // 1 hour
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Add this route to fetch user profile data
router.get('/profile', async (req, res) => {
  try {
    // Extract the token from the headers
    const token = req.headers['x-auth-token'];

    if (!token) {
      return sendErrorResponse(res, 401, 'Access denied');
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user by the decoded userId
    const user = await User.findById(decoded.userId).select('-password'); // Exclude the password from the result

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Return the user data
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile data:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});

// Update Profile Route for User
router.put('/profile', async (req, res) => {
  try {
    // Extract the token from the headers
    const token = req.headers['x-auth-token'];

    if (!token) {
      return sendErrorResponse(res, 401, 'Access denied');
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the user by the decoded userId
    const user = await User.findById(decoded.userId).select('-password'); // Exclude the password from the result

    if (!user) {
      return sendErrorResponse(res, 404, 'User not found');
    }

    // Update user fields with new data from the request body
    const { name, phone, gender, age, favorites, address, pincode } = req.body;

    // Update only fields that are provided in the request body
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (age !== undefined) user.age = age;
    if (favorites !== undefined) user.favorites = favorites;
    if (address !== undefined) user.address = address;
    if (pincode !== undefined) user.pincode = pincode;

    // Save the updated user data
    await user.save();

    // Return the updated user data, excluding the password
    const { password: _, ...updatedUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile data:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});

// Logout Route for User
router.post('/logout', (req, res) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('token');

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});

export default router;
