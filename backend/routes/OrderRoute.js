import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import dotenv from 'dotenv';
import { Book } from '../models/bookModel.js';
import { Order } from '../models/OrderModel.js';
import {Seller} from '../models/sellerModel.js'
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

    res.status(200).json({ message: 'Order placed successfully', order });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while placing the order', error: error.message });
  }
});

// Route to update order status or other attributes and reduce inventory count when shipped
router.patch('/update/:orderId', async (req, res) => {
  try {
    const { status } = req.body; // New status to update
    const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const sellerId = decoded.sellerId;

    // Find the order by its ID
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure the logged-in user is the seller of the order
    if (!order.sellerId.includes(sellerId)) {
      return res.status(403).json({ message: 'You are not authorized to update this order' });
    }

    // Validate if status is provided and if it's a valid status
    const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value. Valid statuses are: Pending, Shipped, Delivered, Cancelled' });
    }

    // Update the order's status
    order.status = status;

    // Reduce inventory count automatically when the order is shipped
    if (status === 'Shipped') {
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        return res.status(404).json({ message: 'Seller not found' });
      }

      // Iterate over each item in the order to update inventory
      for (const item of order.items) {
        const inventoryItem = seller.inventory.find(invItem => 
          invItem.bookId.toString() === item.bookId.toString()
        );
        
        if (!inventoryItem) {
          return res.status(404).json({ message: `Book with ID ${item.bookId} not found in seller inventory` });
        }

        // Check if the inventory is sufficient
        if (inventoryItem.count < item.quantity) {
          return res.status(400).json({ message: `Insufficient inventory for book ID ${item.bookId}` });
        }

        // Reduce the inventory count
        inventoryItem.count -= item.quantity;
      }

      // Save the updated seller inventory
      await seller.save();
    }

    // Save the updated order
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while updating the order', error: error.message });
  }
});


router.patch('/update-inventory/:bookId', async (req, res) => {
  try {
    const { count } = req.body; // New inventory count
    const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const sellerId = decoded.sellerId; // Extract sellerId from token for authorization

    // Find the seller by sellerId
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Find the book in the seller's inventory
    const bookIndex = seller.inventory.findIndex(item => item.bookId.toString() === req.params.bookId);
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found in seller\'s inventory' });
    }

    // Ensure that count is a valid number and non-negative
    if (count < 0) {
      return res.status(400).json({ message: 'Inventory count cannot be negative' });
    }

    // Update the inventory count for the specific book
    seller.inventory[bookIndex].count = count;

    // Save the updated seller inventory
    await seller.save();

    res.status(200).json({ message: 'Inventory updated successfully', inventory: seller.inventory });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while updating the inventory', error: error.message });
  }
});

// Route to cancel an order
router.patch('/cancel/:orderId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from Authorization header
    if (!token) {
      return res.status(401).json({ message: 'Authorization token is missing' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    // Find the order by its ID
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure the logged-in user is the buyer or seller of the order
    if (order.buyerId.toString() !== userId && order.buyerId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to cancel this order' });
    }

    // Check if the order status is 'Shipped' or 'Delivered'
    if (order.status === 'Shipped' || order.status === 'Delivered') {
      return res.status(400).json({ message: 'Shipped or Delivered orders cannot be canceled' });
    }

    // Cancel the order by updating its status to 'Cancelled'
    order.status = 'Cancelled';
    await order.save(); // Save the updated order

    res.status(200).json({ message: 'Order canceled successfully', order });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'An error occurred while canceling the order', error: error.message });
  }
});



export default router;
