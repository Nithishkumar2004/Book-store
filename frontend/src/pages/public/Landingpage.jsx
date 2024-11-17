import React, { useState, useEffect } from 'react';
import BookCard from '../../components/BookCard';
import Endpoint from '../../Endpoint/Endpoint';

const Landingpage = () => {
  // State to store books
  const [books, setBooks] = useState([]);
  // State to handle loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all books when the component mounts
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Make a GET request to the backend to fetch books
        const response = await fetch(`${Endpoint}books/books`); 
        
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        
        // Check if the data has the expected structure
        if (data && data.data) {
          setBooks(data.data); // Store the books in state          
        } else {
          throw new Error('Invalid data structure');
        }

        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        setError(error.message); // Handle any errors
        setLoading(false);
      }
    };

    fetchBooks();
  }, []); // Empty dependency array means this effect runs once when the component mounts

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

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Book List</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.length === 0 ? (
          <p className="text-center text-gray-600">No books found</p>
        ) : (
          books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))
        )}
      </div>
    </div>
  );
};

export default Landingpage;
