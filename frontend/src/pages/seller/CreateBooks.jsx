import React, { useState } from 'react';
import axios from 'axios';
import { FaBook, FaStar, FaGlobe, FaFileAlt } from 'react-icons/fa';
import { GiWhiteBook } from 'react-icons/gi';
import { MdOutlineImage } from 'react-icons/md';
import { FaIndianRupeeSign } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import Endpoint from '../../Endpoint/Endpoint';
import { useSnackbar } from 'notistack';

const CreateBookForm = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { authToken } = useAuth();
  const [formData, setFormData] = useState({
    authToken,  // Send the authToken instead of sellerId
    bookName: '',
    bookImage: '',
    price: 0,
    rating: 0,
    genre: '',
    pages: 1,
    language: '',
    description: '',
    publisherName: '',
    authorName: '',
    isbn: '',
    publicationYear: new Date().getFullYear(),
    edition: '',
  });

  const [imageUrl, setImageUrl] = useState(''); // To store image URL after upload
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(''); // To store image preview URL

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Set the preview of the image
    setImagePreview(URL.createObjectURL(file));
    // Store the file object in state
    setFormData({ ...formData, bookImage: file });
  };

  // Handle actual image upload
  const handleImageUpload = async () => {
    if (!formData.bookImage) return '';  // No image to upload

    const formDataImage = new FormData();
    formDataImage.append('image', formData.bookImage);
    setLoading(true);

    try {
      const response = await axios.post(`${Endpoint}books/uploadimage`, formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(response.data.imageUrl); // Set image URL after successful upload
      setFormData({ ...formData, bookImage: response.data.imageUrl }); // Store the image URL in formData
      enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });

      return response.data.imageUrl; // Return image URL for later use
    } catch (error) {
      console.error('Error uploading image:', error);
      enqueueSnackbar('Failed to upload image', { variant: 'error' });
      return ''; // Return empty if upload failed
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let imageUrl = formData.bookImage;

    // If image is not uploaded yet, trigger the image upload
    if (formData.bookImage instanceof File) {
      imageUrl = await handleImageUpload();
    }

    // Only proceed if the image upload is successful
    if (imageUrl) {
      const updatedFormData = { ...formData, bookImage: imageUrl };

      try {
        const response = await axios.post(`${Endpoint}books/create`, updatedFormData);
        enqueueSnackbar('Book created successfully!', { variant: 'success' });
      } catch (error) {
        console.error('Error creating book:', error);
        enqueueSnackbar('Failed to create book', { variant: 'error' });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded-md space-y-4">
      {/* Book Name */}
      <div className="flex items-center space-x-2">
        <GiWhiteBook />
        <label className="block font-medium">Book Name:</label>
      </div>
      <input
        type="text"
        name="bookName"
        value={formData.bookName}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Book Image */}
      <div className="flex items-center space-x-2">
        <MdOutlineImage />
        <label className="block font-medium">Book Image:</label>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {imagePreview && (
        <div className="mt-2">
          <img src={imagePreview} alt="Image Preview" className="w-32 h-32 object-cover border rounded-md" />
        </div>
      )}

      {/* Price */}
      <div className="flex items-center space-x-2">
        <FaIndianRupeeSign />
        <label className="block font-medium">Price:</label>
      </div>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        min="0"
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Rating */}
      <div className="flex items-center space-x-2">
        <FaStar />
        <label className="block font-medium">Rating (0-5):</label>
      </div>
      <input
        type="number"
        name="rating"
        value={formData.rating}
        onChange={handleChange}
        min="0"
        max="5"
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Genre */}
      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">Genre:</label>
      </div>
      <select
        name="genre"
        value={formData.genre}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select Genre</option>
        <option value="Fiction">Fiction</option>
        <option value="Non-Fiction">Non-Fiction</option>
        <option value="Mystery">Mystery</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Science Fiction">Science Fiction</option>
        <option value="Romance">Romance</option>
        <option value="Biography">Biography</option>
        <option value="Self-Help">Self-Help</option>
        <option value="History">History</option>
      </select>

      {/* Pages */}
      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">Pages:</label>
      </div>
      <input
        type="number"
        name="pages"
        value={formData.pages}
        onChange={handleChange}
        min="1"
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Language */}
      <div className="flex items-center space-x-2">
        <FaGlobe />
        <label className="block font-medium">Language:</label>
      </div>
      <select
        name="language"
        value={formData.language}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">Select Language</option>
        <option value="English">English</option>
        <option value="Hindi">Hindi</option>
        <option value="Tamil">Tamil</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
      </select>

      {/* Description */}
      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">Description:</label>
      </div>
      <textarea
        name="description"
        value={formData.description}
        onChange={handleChange}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Publisher Name */}
      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">Publisher Name:</label>
      </div>
      <input
        type="text"
        name="publisherName"
        value={formData.publisherName}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Author Name */}
      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">Author Name:</label>
      </div>
      <input
        type="text"
        name="authorName"
        value={formData.authorName}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* ISBN */}
      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">ISBN:</label>
      </div>
      <input
        type="text"
        name="isbn"
        value={formData.isbn}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Publication Year */}
      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">Publication Year:</label>
      </div>
      <input
        type="number"
        name="publicationYear"
        value={formData.publicationYear}
        onChange={handleChange}
        min="1900"
        max={new Date().getFullYear()}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Edition */}
      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">Edition:</label>
      </div>
      <input
        type="text"
        name="edition"
        value={formData.edition}
        onChange={handleChange}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full py-2 bg-blue-500 text-white font-bold rounded-md hover:bg-blue-600"
      >
        Create Book
      </button>
    </form>
  );
};

export default CreateBookForm;
