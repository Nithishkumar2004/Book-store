import express from 'express';
import { v2 as cloudinary } from 'cloudinary';  // Correctly import cloudinary v2
import multer from 'multer';
import streamifier from 'streamifier'; // Import streamifier
import { Book } from '../models/bookModel.js';
import { check, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config(); // Load environment variables from .env

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store the image in memory (as a buffer)
const storage = multer.memoryStorage();

// Initialize multer with the memory storage option
const upload = multer({ storage: storage });

// Express route for image upload
router.post('/uploadimage', upload.single('image'), async (req, res) => {
  try {
    // Convert the buffer into a readable stream
    const stream = streamifier.createReadStream(req.file.buffer);

    // Upload image to Cloudinary using the stream
    const result = await cloudinary.uploader.upload_stream(
      { folder: 'books_images' },
      (error, result) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
        }

        // Send the Cloudinary URL in the response
        res.json({ imageUrl: result.secure_url });
      }
    );

    // Pipe the stream to Cloudinary's upload stream
    stream.pipe(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error uploading image to Cloudinary' });
  }
});

// Route to create a new book
router.post(
  '/create',
  [
    // Input validation
    check('bookName').notEmpty().withMessage('Book name is required'),
    check('bookImage').notEmpty().withMessage('Book image URL is required'),
    check('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    check('genre').notEmpty().withMessage('Genre is required'),
    check('pages').isInt({ min: 1 }).withMessage('Pages must be at least 1'),
    check('language').notEmpty().withMessage('Language is required'),
    check('publisherName').notEmpty().withMessage('Publisher name is required'),
    check('authorName').notEmpty().withMessage('Author name is required'),
    check('publicationYear').isInt().withMessage('Publication year must be a valid year'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const {
        authToken,
        bookName,
        bookImage,  // URL of the book image
        price,
        rating,
        genre,
        pages,
        language,
        description,
        publisherName,
        authorName,
        isbn,
        publicationYear,
        edition,
      } = req.body;

      // Verify authToken
      if (!authToken) {
        return res.status(401).json({ success: false, message: 'Authorization token is required' });
      }

      const decoded = jwt.verify(authToken, JWT_SECRET); // Decode token to get sellerId
      const sellerId = decoded.sellerId;  // Extract sellerId from the decoded token

      // Create a new book instance
      const newBook = new Book({
        sellerId, // Use the sellerId from the token
        bookName,
        bookImage,
        price,
        rating,
        genre,
        pages,
        language,
        description,
        publisherName,
        authorName,
        isbn,
        publicationYear,
        edition,
        inventoryCount: 0, // Set default inventory count to 0
      });

      // Save the book to the database
      const savedBook = await newBook.save();

      res.status(201).json({ success: true, message: 'Book created successfully', data: savedBook });
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// Route to update the inventory count of a book
router.put('/updateinventory/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;
    
    // Convert inventoryCount from string to number
    let { inventoryCount } = req.body;
    inventoryCount = Number(inventoryCount);  // Convert string to number

    // Validate the inventory count
    if (!Number.isInteger(inventoryCount) || inventoryCount < 0) {
      return res.status(400).json({ success: false, message: 'Inventory count must be a non-negative integer' });
    }

    // Find the book by its ID and update the inventory count
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }


    book.inventoryCount = inventoryCount;
    await book.save();

    res.status(200).json({ success: true, message: 'Inventory count updated successfully', data: book });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Route to fetch a book by its ID
router.get('/book/:id', async (req, res) => {
  try {
    const bookId = req.params.id;  // Extract bookId from the URL params
    
    // Find the book in the database by its ID
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    res.status(200).json({ success: true, data: book });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to fetch all books
router.get('/books', async (req, res) => {
  try {
    // Find all books in the database
    const books = await Book.find();

    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'No books found' });
    }

    res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Route to fetch books of the current seller
router.get('/mybooks', async (req, res) => {
  try {
    const authToken = req.headers['token'];

    // Check if the authorization token is provided
    if (!authToken) {
      return res.status(401).json({ success: false, message: 'Authorization token is required' });
    }

    // Verify the token and extract seller ID
    const decoded = jwt.verify(authToken, JWT_SECRET);
    const sellerId = decoded.sellerId;

    // Fetch books from the database for the current seller
    const books = await Book.find({ sellerId });

    // Return the list of books
    res.status(200).json({ success: true, books });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, message: 'Error fetching books' });
  }
});

export default router;
