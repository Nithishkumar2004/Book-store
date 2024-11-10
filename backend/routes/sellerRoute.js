import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Seller } from '../models/sellerModel.js';
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

// Register Route for Seller
router.post(
  '/register',
  [
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
      const existingSeller = await Seller.findOne({ email });
      if (existingSeller) {
        return sendErrorResponse(res, 400, 'Seller already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

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
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return sendErrorResponse(res, 400, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return sendErrorResponse(res, 400, 'Invalid email or password');
    }

    const token = jwt.sign({ sellerId: seller._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

    const { password: _, ...sellerWithoutPassword } = seller.toObject();
    
    res.cookie('token', token, {
      httpOnly: false, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      seller: sellerWithoutPassword,
    });
  } catch (error) {
    console.error('Error during login:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});

// Fetch Seller Profile Route
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers['x-auth-token'];

    if (!token) {
      return sendErrorResponse(res, 401, 'Access denied');
    }

    

    const decoded = jwt.verify(token, JWT_SECRET);
    
    const seller = await Seller.findById(decoded.sellerId);

    if (!seller) {
      return sendErrorResponse(res, 404, 'Seller not found');
    }

    const { password, ...sellerData } = seller.toObject();

    res.status(200).json({ success: true, seller: sellerData });
  } catch (error) {
    console.error('Error fetching seller profile:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});

// Update Seller Profile Route
router.put('/profile', async (req, res) => {
  const { name, email, phone, companyName, registrationNumber, address, pincode } = req.body;

  try {
    const token = req.headers['x-auth-token'];

    if (!token) {
      return sendErrorResponse(res, 401, 'Access denied');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const seller = await Seller.findById(decoded.sellerId);

    if (!seller) {
      return sendErrorResponse(res, 404, 'Seller not found');
    }

    seller.name = name || seller.name;
    seller.email = email || seller.email;
    seller.phone = phone || seller.phone;
    seller.companyName = companyName || seller.companyName;
    seller.registrationNumber = registrationNumber || seller.registrationNumber;
    seller.address = address || seller.address;
    seller.pincode = pincode || seller.pincode;

    await seller.save();

    const { password, ...updatedSellerData } = seller.toObject();

    res.status(200).json({ success: true, message: 'Profile updated successfully', seller: updatedSellerData });
  } catch (error) {
    console.error('Error updating seller profile:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});

export default router;
