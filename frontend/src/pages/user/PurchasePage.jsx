import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PurchasePage = () => {
  const { id } = useParams(); // Extracting the book ID from the URL
  const [book, setBook] = useState(null); // State to hold the book details
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for error handling
  console.log(id);
  

  // Fetch book details when the component mounts or the ID changes
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`http://localhost:3000/books/book/${id}`); // Adjust API URL as necessary
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        const data = await response.json();
        console.log(data);
        
        setBook(data); // Store book details in state
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        setError(error.message); // Handle any errors
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [id]); // Dependency on the ID, so it refetches when the ID changes

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  // If book is not found
  if (!book) {
    return <div className="text-center text-gray-600">Book not found</div>;
  }

  // Destructure book details
  const {
    bookImage,
    bookName,
    authorName,
    genre,
    publicationYear,
    description,
    price,
    pages,
    isbn,
    language,
  } = book;

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6">{bookName}</h2>
      
      <div className="flex flex-col items-center">
        {/* Book Image */}
        <img src={bookImage} alt={bookName} className="w-64 h-96 object-cover mb-4" />
        
        {/* Book Details */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-800">Author: {authorName}</p>
          <p className="text-md text-gray-600 mt-2">Genre: {genre}</p>
          <p className="text-md text-gray-600 mt-2">Published: {publicationYear}</p>
          <p className="text-md text-gray-600 mt-2">Pages: {pages}</p>
          <p className="text-md text-gray-600 mt-2">ISBN: {isbn}</p>
          <p className="text-md text-gray-600 mt-2">Language: {language}</p>
          <p className="text-md text-gray-600 mt-2">Price: ₹{price}</p>
          
          {/* Book Description */}
          <p className="text-gray-700 mt-4">{description}</p>

          {/* Purchase Button */}
          <div className="mt-6">
            <button
              className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-6 rounded-md"
              onClick={() => alert(`Proceeding to purchase: ${bookName}`)} // Placeholder action
            >
              Purchase Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasePage;
