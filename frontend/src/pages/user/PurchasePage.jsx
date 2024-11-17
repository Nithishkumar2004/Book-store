import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Endpoint from '../../Endpoint/Endpoint';
import { useAuth } from '../../context/AuthContext';
import { useSnackbar } from 'notistack';

const PurchasePage = () => {
  const { enqueueSnackbar } = useSnackbar();

  const { id } = useParams(); // Extracting the book ID from the URL
  const [book, setBook] = useState({}); // State to hold the book details
  const [loading, setLoading] = useState(true); // State for loading state
  const [error, setError] = useState(null); // State for error handling
  const { authToken } = useAuth();
  const [quantity, setQuantity] = useState(1); // State for quantity count
  const navigate = useNavigate(); // Hook for navigation

  // Fetch book details when the component mounts or the ID changes
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`${Endpoint}books/book/${id}`); // Adjust API URL as necessary
        if (!response.ok) {
          throw new Error('Failed to fetch book details');
        }
        const responseData = await response.json();
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

  // Calculate payable amount
  const payableAmount = (price * quantity).toFixed(2);

  // Handler for adding the book to the cart
  const handleAddToCart = async () => {
    try {
      const response = await fetch(`${Endpoint}user/addcart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: authToken, bookId: id, quantity }),
      });
      if (!response.ok) {
        throw new Error('Failed to add book to cart');
      }
      enqueueSnackbar('Book added to cart successfully!', { variant: 'success' });

      enqueueSnackbar
    } catch (error) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });

    }
  };

  // Handler for purchasing the book
  const handlePurchase = async () => {
    try {
      // Trigger add to cart first
      await handleAddToCart();
      // Navigate to cart
      navigate('/cart');
    } catch (error) {
      enqueueSnackbar(`Error: ${error.message}`, { variant: 'error' });

    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 border rounded shadow-lg md:p-6 lg:p-8">
      <img src={bookImage} alt={bookName} className="w-full h-64 object-cover mb-4" />
      <h1 className="text-2xl font-bold mb-2">{bookName}</h1>
      <p className="text-gray-700 mb-2"><strong>Author:</strong> {authorName}</p>
      <p className="text-gray-700 mb-2"><strong>Genre:</strong> {genre}</p>
      <p className="text-gray-700 mb-2"><strong>Publication Year:</strong> {publicationYear}</p>
      <p className="text-gray-700 mb-2"><strong>Pages:</strong> {pages}</p>
      <p className="text-gray-700 mb-2"><strong>ISBN:</strong> {isbn}</p>
      <p className="text-gray-700 mb-2"><strong>Language:</strong> {language}</p>
      <p className="text-gray-700 mb-4"><strong>Description:</strong> {description}</p>
      <p className="text-xl font-bold text-green-600 mb-4">Price:₹{price}</p>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
        <label htmlFor="quantity" className="font-semibold">Quantity:</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="border rounded w-16 text-center"
        />
      </div>

      <p className="text-lg font-bold text-gray-800 mb-4">Payable Amount: ₹{payableAmount}</p>

      <div className="flex gap-4 flex-wrap">
        <button
          onClick={handleAddToCart}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
        >
          Add to Cart
        </button>
        <button
          onClick={handlePurchase}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded w-full md:w-auto"
        >
          Purchase
        </button>
      </div>
    </div>
  );
};

export default PurchasePage;