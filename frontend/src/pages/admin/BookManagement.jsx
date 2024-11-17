import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Axios for making HTTP requests
import Endpoint from '../../Endpoint/Endpoint';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ genre: '', language: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const bookResponse = await axios.get(`${Endpoint}admin/books`);
        setBooks(bookResponse.data.books);
        setFilteredBooks(bookResponse.data.books);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const filtered = books.filter(book =>
      (book.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filters.genre === '' || book.genre === filters.genre) &&
      (filters.language === '' || book.language === filters.language)
    );
    setFilteredBooks(filtered);
  }, [searchTerm, books, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Book Management</h1>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by book name, author, or genre..."
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Filter dropdowns */}
      <div className="mb-4 flex space-x-4">
        <select
          name="genre"
          value={filters.genre}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="">All Genres</option>
          <option value="Non-Fiction">Non-Fiction</option>
          <option value="Mystery">Mystery</option>
          {/* Add more genre options as needed */}
        </select>
        <select
          name="language"
          value={filters.language}
          onChange={handleFilterChange}
          className="p-2 border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="">All Languages</option>
          <option value="Tamil">Tamil</option>
          <option value="Hindi">Hindi</option>
          {/* Add more language options as needed */}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 border">Image</th>
              <th className="px-4 py-2 border">Book Name</th>
              <th className="px-4 py-2 border">Author</th>
              <th className="px-4 py-2 border">Genre</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Language</th>
              <th className="px-4 py-2 border">Publication Year</th>
            </tr>
          </thead>
          <tbody>
            {filteredBooks.map((book) => (
              <tr key={book._id} className="text-gray-700">
                <td className="px-4 py-2 border">
                  <img
                    src={book.bookImage}
                    alt={book.bookName}
                    className="w-16 h-20 object-cover rounded-md"
                  />
                </td>
                <td className="px-4 py-2 border">{book.bookName}</td>
                <td className="px-4 py-2 border">{book.authorName}</td>
                <td className="px-4 py-2 border">{book.genre}</td>
                <td className="px-4 py-2 border">${book.price}</td>
                <td className="px-4 py-2 border">{book.language}</td>
                <td className="px-4 py-2 border">{book.publicationYear}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookManagement;