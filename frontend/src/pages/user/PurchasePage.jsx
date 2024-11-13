import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Endpoint from '../../Endpoint/Endpoint';

const PurchasePage = () => {
  const { id } = useParams(); // Extracting the book ID from the URL
  const [book, setBook] = useState({}); // State to hold the book details
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for error handling

  console.log(id); // Log the ID to ensure it's being captured

  // Fetch book details when the component mounts or the ID changes
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`${Endpoint}books/book/${id}`); // Adjust API URL as necessary
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        const responseData = await response.json();
        console.log('Fetched data:', responseData); // Log response to check structure

        setBook(responseData.data); // Store the book details in state
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

  // If book is not found or is empty
  if (!book || Object.keys(book).length === 0) {
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

  console.log(book); // Log the book object to confirm structure

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-6">{bookName}</h2>
  
      <div className="flex flex-col lg:flex-row justify-start gap-8 lg:gap-12">
        {/* Book Image */}
        <div className='w-full lg:w-1/2'>
          <img src={bookImage} alt={bookName} className="w-full h-auto object-cover mb-4" />
        </div>
        
        {/* Book Details */}
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <p className="text-lg font-semibold text-gray-800">Author: {authorName}</p>
          <p className="text-md text-gray-600 mt-2">Genre: {genre}</p>
          <p className="text-md text-gray-600 mt-2">Published: {publicationYear}</p>
          <p className="text-md text-gray-600 mt-2">Pages: {pages}</p>
          <p className="text-md text-gray-600 mt-2">ISBN: {isbn}</p>
          <p className="text-md text-gray-600 mt-2">Language: {language}</p>
          <p className="text-md text-gray-700 mt-4">{description}</p>
          <p className="text-lg font-bold text-gray-900 mt-6">Price: ${price}</p>
          <button
            className="text-white bg-blue-500 hover:bg-blue-600 py-2 px-6 rounded-md mt-4"
            onClick={() => alert(`Proceeding to purchase: ${bookName}`)}
          >
            Purchase Book
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default PurchasePage;
