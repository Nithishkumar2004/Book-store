import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
import { check, validationResult } from 'express-validator'; // For request validation
import cookieParser from 'cookie-parser';
import { Book } from '../models/bookModel.js';
import { Order } from '../models/OrderModel.js';
import {mongoose} from 'mongoose';

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
    const user = await User.findById(decoded.userId).select('-password -cart -orderedItems'); // Exclude the password from the result

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
    const user = await User.findById(decoded.userId).select('-password -orderedItems -cart'); // Exclude the password from the result

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
    res.clearCookie('authToken');

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});

// Backend route for adding to cart
router.post('/addcart', async (req, res) => {
  try {
    const { token, bookId, quantity } = req.body; // Extract user ID, book ID, and quantity from request

    const sellerId = Book.findById(bookId).select('sellerId');
    
    const decoded = jwt.verify(token, JWT_SECRET); // Decode token to get sellerId
    const userId = decoded.userId;
    
    
    // Find user and update cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the book already exists in the cart
    const existingCartItem = user.cart.find(item => item.book.toString() === bookId);
    if (existingCartItem) {
      existingCartItem.quantity += quantity; // Update quantity if book already in cart
    } else {
      user.cart.push({ book: bookId, quantity }); // Add new item to cart
    }

    await user.save(); // Save updated user data
    res.status(200).json({ message: 'Book added to cart successfully', cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add book to cart', error: error.message });
  }
});

// Route to fetch the cart items with book and seller details
router.get('/cart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Decode the token to get the user ID
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Find the user in the database
    const user = await User.findById(userId).populate({
      path: 'cart.book',
      populate: {
        path: 'sellerId', // Assuming sellerId is a reference to the User model
        select: 'name email phone companyName', // Choose the seller details you want to return
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the user's cart with book and seller details as a response
    res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch cart items', error: error.message });
  }
});


// Route to delete an item from the cart
router.delete('/cart/item/', async (req, res) => {
  try {
    // Extract token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    const { itemId } = req.body; // Extract itemId from the request body

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Decode the token to get the user ID
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate itemId before proceeding
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    
    

    // Filter out the item from the cart by converting item.book to string and comparing with itemId
    user.cart = user.cart.filter(item => {


      const currentid = item._id.toString()
   
      
      const valid= currentid !== itemId;
   

      return valid; // Keep the item if it's not the one to remove
    });


    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Item removed from cart', cart: user.cart });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
  }
});

router.delete('/cart', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Decode the token to get the user ID
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Find the user and empty the cart
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Empty the cart
    user.cart = [];

    await user.save(); // Save the updated user document

    res.status(200).json({ message: 'Cart deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete cart', error: error.message });
  }
});


router.get('/orders', async (req, res) => {
  try {

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    // Verify JWT and decode user information
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Fetch the orders of the user
    const orders = await Order.find({ buyerId: userId });

    if (orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    // Gather all unique bookIds from all the items in the orders
    const bookIds = [...new Set(orders.flatMap(order => order.items.map(item => item.bookId)))];

    // Fetch book details for all unique bookIds
    const books = await Book.find({ '_id': { $in: bookIds } });



    // Send the book details in the response
    res.status(200).json({ books: books ,orders:orders});

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while fetching book details', error: error.message });
  }
});



router.put('/cart/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    const { quantity } = req.body; // Extract the new quantity from the request body
    const { id } = req.params; // Extract the item ID from the URL parameter

    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    // Decode the token to get the user ID
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate the quantity input
    if (quantity < 1 || isNaN(quantity)) {
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Find the item in the cart and update its quantity
    let itemUpdated = false;
    user.cart = user.cart.map(item => {
      if (item._id.toString() === id) {
        item.quantity = quantity; // Update the item quantity
        itemUpdated = true;
      }
      return item;
    });

    if (!itemUpdated) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Save the updated user document
    await user.save();

    res.status(200).json({ message: 'Cart updated successfully', cart: user.cart });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
});


export default router;
