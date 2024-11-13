import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBook } from 'react-icons/fa'; // Import the book icon from react-icons
import Endpoint from '../../Endpoint/Endpoint';

const InventoryManagement = () => {
  const [books, setBooks] = useState([]);
  const [inventoryCount, setInventoryCount] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books when the component mounts
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${Endpoint}books/books`); // Update with your endpoint for fetching books
        setBooks(response.data.data); // Assuming books are in response.data.data
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books');
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Handle inventory count change
  const handleInventoryChange = (bookId, value) => {
    if (isNaN(value) || value < 0) {
      setError('Please enter a valid non-negative number');
    } else {
      setError(null); // Reset error when valid input is provided
    }
    setInventoryCount(prev => ({
      ...prev,
      [bookId]: value
    }));
  };

  // Handle inventory update submission
  const handleUpdateInventory = async (bookId) => {
    try {
      const updatedInventory = inventoryCount[bookId];

      if (updatedInventory === undefined || updatedInventory < 0) {
        setError('Please provide a valid inventory count');
        return;
      }

      // Send the update request to the server
      await axios.put(`${Endpoint}books/updateinventory/${bookId}`, { inventoryCount: updatedInventory });

      // Optimistically update the local state without reloading
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book._id === bookId ? { ...book, inventoryCount: updatedInventory } : book
        )
      );

      // Clear the input field for the updated book
      setInventoryCount((prevCount) => ({
        ...prevCount,
        [bookId]: ''
      }));

      alert('Inventory updated successfully');
    } catch (err) {
      setError('Failed to update inventory');
    }
  };

  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.bookName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-4">Loading books...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-center mb-6">
        <FaBook className="inline-block mr-2" /> Inventory Management
      </h1>

      {/* Search bar */}
      <div className="mb-4 text-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-1/3"
          placeholder="Search books by name"
        />
      </div>

      {filteredBooks.length === 0 ? (
        <p className="text-center">No books available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto bg-white shadow-lg border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Image</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Book Name</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">ISBN</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Current Inventory</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Update Inventory</th>
                <th className="py-2 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book._id} className="border-t">
                  <td className="py-2 px-4 text-sm text-gray-800">
                    <img src={book.bookImage} alt={book.bookName} className="w-12 h-12 object-cover rounded-md" />
                  </td>
                  <td className="py-2 px-4 text-sm text-gray-800">{book.bookName}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{book.isbn}</td>
                  <td className="py-2 px-4 text-sm text-gray-800">{book.inventoryCount}</td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={inventoryCount[book._id] || ''}
                      onChange={(e) => handleInventoryChange(book._id, e.target.value)}
                      min="0"
                      className="border border-gray-300 p-2 rounded-md w-full"
                      placeholder="Update inventory"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleUpdateInventory(book._id)}  // Trigger the update and clear the input
                      className="bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600 transition"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
