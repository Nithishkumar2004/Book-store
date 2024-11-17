import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { User } from '../models/userModel.js';
import { Seller } from '../models/sellerModel.js';
import {Book} from '../models/bookModel.js'

// Initialize environment variables
dotenv.config();
const router = express.Router();

// Helper function to send errors
const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ success: false, message });
};

router.use(cookieParser());

//Fetch all Books 
router.get('/books',async (req,res)=>{
try{
  const books = await Book.find();

  if(!books){
    return sendErrorResponse(res,404,"No books found")
  }
  res.status(200).json({
    success:true,
    books:books,
  })
}
catch(error)
{
  sendErrorResponse(res,500,"server error")

}
});


// Fetch all users
router.get('/users', async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find().select('-password'); // Exclude password from the result
    
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

// New route to fetch book count for users, sellers, and total book count
router.get('/counts', async (req, res) => {
  try {
    // Fetch the total count of books in the database
    const totalBookCount = await Book.countDocuments();
    const totalUserCount = await User.countDocuments();
    const totalSellerCount = await Seller.countDocuments();
    // Send the response with total, user, and seller book counts
    res.status(200).json({
      success: true,
      totalBookCount:totalBookCount, // Total book count
      totalUserCount: totalUserCount,
      totalSellerCount: totalSellerCount,
    });
  } catch (error) {
    console.error('Error fetching book counts:', error);
    sendErrorResponse(res, 500, 'Server error');
  }
});

export default router;
