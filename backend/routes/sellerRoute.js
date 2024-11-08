import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Seller } from '../models/sellerModel.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator'; // For request validation

dotenv.config(); // Load environment variables from .env

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h'; // Default expiry is 1 hour if not set

// Helper function to send errors
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ success: false, message });
};

// Register Route for Seller
router.post(
  '/register',
  [
    // Input validation using express-validator
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please provide a valid email'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    check('phone').isNumeric().withMessage('Phone number must be numeric'),
    check('companyName').notEmpty().withMessage('Company name is required'),
    check('registrationNumber').notEmpty().withMessage('Business registration number is required'),
    check('address').notEmpty().withMessage('Address is required'),
    check('pincode').isNumeric().withMessage('Pincode must be numeric'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendErrorResponse(res, 400, errors.array().map(err => err.msg).join(', '));
    }

    const { name, email, password, phone, companyName, registrationNumber, address, pincode } = req.body;

    try {
      // Check if seller already exists
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        return sendErrorResponse(res, 400, 'Seller already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new seller
      const newSeller = new Seller({
        name,
        email,
        password: hashedPassword,
        phone,
        companyName,
        registrationNumber,
        address,
        pincode,
      });

      await newSeller.save();

      // Exclude password from the response
      const { password: _, ...sellerWithoutPassword } = newSeller.toObject();

      res.status(201).json({ success: true, message: 'Seller registration successful', seller: sellerWithoutPassword });
    } catch (error) {
      console.error('Error registering seller:', error);
      sendErrorResponse(res, 500, 'Server error');
    }
  }
);

// Login Route for Seller
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if seller exists
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return sendErrorResponse(res, 400, 'Invalid email or password');
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return sendErrorResponse(res, 400, 'Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign({ sellerId: seller._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      seller: { id: seller._id, name: seller.name, email: seller.email },
    });
  } catch (error) {
    console.error('Error during login:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});



export default router;
