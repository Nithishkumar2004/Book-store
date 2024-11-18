import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Seller } from '../models/sellerModel.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator'; // For request validation
import cookieParser from 'cookie-parser';
import { Order } from '../models/OrderModel.js';
import { User } from '../models/userModel.js';
import { Book } from '../models/bookModel.js';

dotenv.config(); // Load environment variables from .env

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || 360000// Default expiry is 1 hour if not set

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


    res.cookie('authToken', token, {
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


// Fetch Seller  Inventory Route
router.get('/inventory', async (req, res) => {
  try {
    const token = req.headers['x-auth-token'];

    if (!token) {
      return sendErrorResponse(res, 401, 'Access denied');
    }

    // Decode the token to get seller information
    const decoded = jwt.verify(token, JWT_SECRET);

    // Find the seller by their ID and retrieve the inventory
    const seller = await Seller.findById(decoded.sellerId).select('inventory');

    if (!seller) {
      return sendErrorResponse(res, 404, 'Seller not found');
    }

    // Fetch details of books using the bookId from inventory
    const bookDetailsPromises = seller.inventory.map(async (item) => {
      const book = await Book.findById(item.bookId).select('bookName authorName price bookImage');  // Selecting essential fields
      if (!book) {
        return null;  // Handle case where book doesn't exist
      }
      return {
        bookId: book._id,
        bookName: book.bookName,
        authorName: book.authorName,
        price: book.price,
        bookImage: book.bookImage,  // Include book image
        count: item.count
      };
    });

    // Wait for all book details to be fetched
    const books = await Promise.all(bookDetailsPromises);

    // Filter out any null values in case some books weren't found
    const validBooks = books.filter(book => book !== null);

    // Return the seller's inventory along with book details
    res.status(200).json({
      success: true,
      seller: {
        _id: seller._id,
        inventory: validBooks
      }
    });
  } catch (error) {
    console.error('Error fetching seller profile and inventory:', error);
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

// Route to fetch counts for the current seller
router.get('/counts', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authToken = req.headers.authorization;

    if (!authToken) {
      return sendErrorResponse(res, 400, 'Authorization token is required');
    }

    // Extract token from 'Bearer <token>'
    const token = authToken.split(' ')[1];

    // Decode and verify the token
    const decoded = jwt.verify(token, JWT_SECRET); // Replace with your actual secret key
    const sellerId = decoded.sellerId; // Extract sellerId from decoded token
    
    // Fetch the count of books, users, and orders for the current seller
    const [sellerBookCount, sellerUserCount, sellerOrderCount] = await Promise.all([
      Book.countDocuments({ sellerId: sellerId }), // Fetch book count for the seller
      User.countDocuments(), // Fetch user count for the seller
      Order.countDocuments({ sellerId: sellerId }), // Fetch order count for the seller
    ]);

    // Send the response with current seller's book, user, and order counts
    res.status(200).json({
      success: true,
      sellerBookCount,  // Seller's book count
      sellerUserCount,  // Seller's user count
      sellerOrderCount, // Seller's order count
    });

  } catch (error) {
    console.error('Error fetching counts:', error);
    
    // Handle errors: If token is invalid or expired, or any other server error
    if (error.name === 'JsonWebTokenError') {
      return sendErrorResponse(res, 401, 'Invalid or expired token');
    }
    
    // General server error
    return sendErrorResponse(res, 500, 'Server error');
  }
});


router.put('/update-inventory/:bookId', async (req, res) => {
  const { bookId } = req.params;
  const authToken = req.headers['x-auth-token'];
  

  // Check if the authorization token is provided
  if (!authToken) {
    return res.status(401).json({ success: false, message: 'Authorization token is required' });
  }

  try {
    // Verify the token and extract seller ID
    const decoded = jwt.verify(authToken, JWT_SECRET);
    const sellerId = decoded.sellerId;

    // Extract and convert inventory count from request body
    let { inventoryCount } = req.body;
    inventoryCount = Number(inventoryCount);


    // Ensure inventoryCount is provided and is a valid number
    if (isNaN(inventoryCount) || inventoryCount < 0) {
      return res.status(400).json({ message: 'Invalid inventoryCount value' });
    }
  
    // Find the seller and update the specific book's inventory count

    const seller = await Seller.findOneAndUpdate(
      { _id: sellerId, 'inventory.bookId': bookId },
      { $set: { 'inventory.$.count': inventoryCount } },
      { new: true }
    );

    if (!seller) {
     
      return res.status(404).json({ message: 'Seller or book not found' });
    }

    res.status(200).json({ message: 'Inventory updated successfully', seller });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating inventory', error: error.message });
  }
});
// Route to get the orders for a specific seller
router.get('/orders', async (req, res) => {
  try {
    // Get the authorization token from the headers
    const token = req.headers.authorization?.split(' ')[1];

    // Check if token is provided
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    const sellerId = decoded.sellerId;  // Extract sellerId from decoded token
    
    // Find the seller from the database
    const seller = await Seller.findById(sellerId).select('-password');
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }
    

    // Fetch orders where the sellerId is in the sellerIds array (assuming orders belong to one seller only)
    const orders = await Order.find({ sellerId: sellerId });
    const books = await Book.find({sellerId:sellerId});
    // If no orders found
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this seller' });
    }
    


    // Return the orders with detailed information
    res.status(200).json({ orders: orders,seller:seller,books:books});
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'An error occurred while fetching the seller orders', error: error.message });
  }
});




export default router;
