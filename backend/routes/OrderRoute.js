import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
import { Book } from '../models/bookModel.js';
import { Order } from '../models/OrderModel.js';

dotenv.config(); // Load environment variables from .env

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

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
    let sellerId = null; // Variable to store the seller ID for consistency

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

      const itemTotalPrice = item.quantity * item.price;
      calculatedTotalAmount += itemTotalPrice;

      // Check if this is the first item or if it belongs to the same seller
      if (sellerId === null) {
        sellerId = book.sellerId;  // Set the seller ID from the first item
      } else if (!sellerId.equals(book.sellerId)) {
        return res.status(400).json({ message: 'All books must belong to the same seller. Please remove items from different sellers.' });
      }

      orderItems.push({
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.price,
        totalPrice: itemTotalPrice,
        sellerId: book.sellerId, // Still store sellerId for each item but will use the same sellerId
      });
    }

    // Create the order with the common sellerId
    const order = new Order({
      buyerId: userId,
      sellerId, // Store only one sellerId
      items: orderItems, // Store items with their details
      totalAmount: calculatedTotalAmount, // Use the calculated total amount
      status: 'Pending',
      shippingAddress,
      createdAt: new Date(),
    });

    await order.save();

    // Clear the user's cart after placing the order
    user.cart = [];  // Clear the cart
    await user.save();  // Save the updated user document

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while placing the order', error: error.message });
  }
});


export default router;
