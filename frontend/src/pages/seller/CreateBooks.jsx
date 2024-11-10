import React, { useState } from 'react';
import axios from 'axios';
import { FaBook, FaDollarSign, FaStar, FaGlobe, FaFileAlt } from 'react-icons/fa';
import { GiWhiteBook } from 'react-icons/gi';
import { MdOutlineImage } from 'react-icons/md';
import { FaIndianRupeeSign } from "react-icons/fa6";

const CreateBookForm = () => {
  const [formData, setFormData] = useState({
    sellerId: '',
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formDataImage = new FormData();
    formDataImage.append('image', file);

    try {
      const response = await axios.post('http://localhost:3000/image/upload', formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(response.data.imageUrl); // Set image URL after successful upload
      setFormData({ ...formData, bookImage: response.data.imageUrl }); // Store the image URL in formData
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/books/create', formData);
      alert('Book created successfully!');
    } catch (error) {
      console.error('Error creating book:', error);
      alert('Failed to create book');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 bg-white shadow-md rounded-md space-y-4">
      <div className="flex items-center space-x-2">
        <FaBook />
        <label className="block font-medium">Seller ID:</label>
      </div>
      <input
        type="text"
        name="sellerId"
        value={formData.sellerId}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

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

      <div className="flex items-center space-x-2">
        <MdOutlineImage />
        <label className="block font-medium">Book Image:</label>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {loading && <p>Uploading image...</p>}

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

      <div className="flex items-center space-x-2">
        <FaFileAlt />
        <label className="block font-medium">Genre:</label>
      </div>
      <input
        type="text"
        name="genre"
        value={formData.genre}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      <div className="flex items-center space-x-2">
        <FaGlobe />
        <label className="block font-medium">Language:</label>
      </div>
      <input
        type="text"
        name="language"
        value={formData.language}
        onChange={handleChange}
        required
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

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

      <button type="submit" className="w-full bg-indigo-500 text-white p-2 rounded-md hover:bg-indigo-600">
        Create Book
      </button>
    </form>
  );
};

export default CreateBookForm;
