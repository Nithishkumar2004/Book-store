import mongoose from 'mongoose';

// Seller Schema
const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    unique: true
  },
  address: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'  // List of books associated with the seller
  }],
  ratings: {
    type: Number,
    default: 0
  },
  inventory: [{
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',  // Reference to Book
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 0,
      default: 0  // Inventory count for this book
    }
  }],
  orders: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',  // Reference to Order
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 0,
      default: 0  // Count of books ordered
    }
  }]
}, { timestamps: true });

// Seller Model
const Seller = mongoose.model('Seller', sellerSchema);

export { Seller };