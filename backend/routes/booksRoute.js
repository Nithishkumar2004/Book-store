import express from 'express';
import { v2 as cloudinary } from 'cloudinary';  // Correctly import cloudinary v2
import multer from 'multer';
import { Book } from '../models/bookModel.js';
import { check, validationResult } from 'express-validator';

const router = express.Router();

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
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.buffer, {
      folder: 'folder_name',  // Optional: Specify the folder name
    });

    // Send the Cloudinary URL in the response
    res.json({ imageUrl: result.secure_url });
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
    check('sellerId').notEmpty().withMessage('Seller ID is required'),
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
        sellerId,
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
      } = req.body;

      // Create a new book instance
      const newBook = new Book({
        sellerId,
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

export default router;
