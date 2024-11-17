import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
import { Book } from '../models/bookModel.js';
import { Order } from '../models/OrderModel.js';

dotenv.config(); // Load environment variables from .env

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h'; // Default expiry is 1 hour if not set

router.post('/create', async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const shippingAddress = user.address;
    const orderItems = [];
    const sellerIds = []; // To keep track of all sellers in the order

    // Ensure the totalAmount passed matches the calculated total
    let calculatedTotalAmount = 0;

    for (const item of items) {
      if (!item.bookId) {
        return res.status(400).json({ message: 'Book ID is required for each item' });
      }

      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ message: `Book with ID ${item.bookId} not found` });
      }

      sellerIds.push(book.sellerId); // Store sellerId as ObjectId

      const itemTotalPrice = item.quantity * item.price;
      calculatedTotalAmount += itemTotalPrice;

      orderItems.push({
        book: item.bookId,
        quantity: item.quantity,
        price: item.price,
        totalPrice: itemTotalPrice,
        sellerId: book.sellerId, // Add sellerId to each item
      });
    }

    // Ensure all items belong to the same seller
    if (new Set(sellerIds.map(id => id.toString())).size > 1) {
      return res.status(400).json({ message: 'All books must belong to the same seller' });
    }

    // If everything checks out, create the order
    const order = new Order({
      buyerId: userId,
      sellerIds, // Store sellerId list as ObjectId array
      items: orderItems, // Store items with their details
      totalAmount, // Keep using the totalAmount passed from the frontend
      status: 'Pending',
      shippingAddress,
      createdAt: new Date(),
    });

    await order.save();

    // Clear the user's cart after placing the order
    user.cart = [];
    await user.save();

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while placing the order', error: error.message });
  }
});



export default router;