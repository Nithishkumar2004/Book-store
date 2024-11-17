import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBook } from 'react-icons/fa';
import Endpoint from '../../Endpoint/Endpoint';
import { useAuth } from '../../context/AuthContext';

const BookInventoryTable = ({ books, onUpdateInventory }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Book
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Current Inventory
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Purchased
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Update
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {books.map((book) => (
            <tr key={book._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{book.bookName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <img
                  src={book.bookImage}
                  alt={book.bookName}
                  className="h-16 w-16 object-cover rounded"
                />
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {book.inventoryCount || 'Not Available'} {/* Display inventory count */}
                </span>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {book.purchasedCount}
                </span>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <button
                  onClick={() => onUpdateInventory(book._id, book.inventoryCount)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InventoryManagement = () => {
  const [books, setBooks] = useState([]);
  const [inventoryCount, setInventoryCount] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatedBookId, setUpdatedBookId] = useState(null);
  const [updatedInventory, setUpdatedInventory] = useState(null);
  const { authToken } = useAuth();
  
  // Fetch books when the component mounts
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(`${Endpoint}books/mybooks`, {
          headers: {
            'X-Auth-Token': authToken,
          },
        });        
        setBooks(response.data.books);

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch books');
        setLoading(false);
      }
    };

    fetchBooks();
  }, [authToken]);

  // Handle inventory update submission
  const handleUpdateInventory = (bookId, currentInventory) => {
    setUpdatedBookId(bookId);
    setUpdatedInventory(currentInventory || '');  // Ensure the value is set correctly
    setShowUpdateModal(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      await axios.put(`${Endpoint}seller/update-inventory/${updatedBookId}`, { inventoryCount: updatedInventory }, {
        headers: { 'x-auth-token': authToken },
      });

      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book._id === updatedBookId ? { ...book, inventoryCount: updatedInventory } : book
        )
      );

      setShowUpdateModal(false);
      setUpdatedBookId(null);
      setUpdatedInventory(null);
    } catch (err) {
      setError('Failed to update inventory');
    }
  };

  const handleCancelUpdate = () => {
    setShowUpdateModal(false);
    setUpdatedBookId(null);
    setUpdatedInventory(null);
  };

  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.bookName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-4">Loading books...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-semibold text-center mb-6">
        <FaBook className="inline-block mr-2" /> Inventory Management
      </h1>
      <input
        type="text"
        placeholder="Search books..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />

      <BookInventoryTable books={filteredBooks} onUpdateInventory={handleUpdateInventory} />

      {/* Update Inventory Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Update Inventory</h2>
            <p className="mb-4">Enter the new inventory count for the selected book:</p>
            <input
              type="number"
              className="w-full p-2 mb-4 border rounded"
              value={updatedInventory || ''}
              onChange={(e) => setUpdatedInventory(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={handleConfirmUpdate}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Confirm
              </button>
              <button
                onClick={handleCancelUpdate}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
