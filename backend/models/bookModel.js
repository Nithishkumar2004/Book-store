import mongoose from 'mongoose';

// Book Schema
const bookSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller', // Refers to the seller who is listing the book
    required: true
  },
  bookName: {
    type: String,
    required: true,
    trim: true
  },
  bookImage: {
    type: String, // URL of the image or file path if you are saving locally
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  genre: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    required: true,
    min: 1
  },
  language: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true,
  },
  publisherName: {
    type: String,
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  isbn: {
    type: String, // International Standard Book Number (optional)
    unique: true,
    sparse: true
  },
  publicationYear: {
    type: Number, // Year the book was published
    required: true
  },
  edition: {
    type: String, // Edition information (optional)
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Book Model
const Book = mongoose.model('Book', bookSchema);

export { Book };
