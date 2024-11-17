import mongoose from 'mongoose';

// Book Schema
const bookSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',  // Refers to the seller listing the book
    required: true
  },
  bookName: {
    type: String,
    required: true,
    trim: true
  },
  bookImage: {
    type: String,  // URL or file path for the book image
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
    trim: true
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
    type: String,  // Optional International Standard Book Number
    unique: true,
    sparse: true
  },
  publicationYear: {
    type: Number,
    required: true
  },
  edition: {
    type: String,  // Optional edition information
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