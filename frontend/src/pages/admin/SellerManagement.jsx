import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Endpoint from '../../Endpoint/Endpoint';

const SellerManagement = () => {
  // State to store seller data, loading, error, search term, and pagination info
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch sellers data on component mount
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await axios.get(`${Endpoint}admin/sellers`); // Adjust endpoint as needed
        setSellers(response.data.sellers);
        setFilteredSellers(response.data.sellers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        setError('Error fetching sellers data');
        setLoading(false);
      }
    };

    fetchSellers();
  }, []);

  // Handle search input change and filter the sellers
  const handleSearchChange = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = sellers.filter(
      (seller) =>
        seller.name.toLowerCase().includes(value) ||
        seller.email.toLowerCase().includes(value) ||
        seller.companyName.toLowerCase().includes(value)
    );
    setFilteredSellers(filtered);
    setCurrentPage(1); // Reset to the first page after filtering
  };

  // Handle pagination
  const indexOfLastSeller = currentPage * itemsPerPage;
  const indexOfFirstSeller = indexOfLastSeller - itemsPerPage;
  const currentSellers = filteredSellers.slice(indexOfFirstSeller, indexOfLastSeller);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Seller Management</h1>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by name, email, or company"
          className="px-4 py-2 border rounded-md w-full"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Company</th>
              <th className="px-4 py-2 border">Registration Number</th>
              <th className="px-4 py-2 border">Address</th>
              <th className="px-4 py-2 border">Pincode</th>
            </tr>
          </thead>
          <tbody>
            {currentSellers.length > 0 ? (
              currentSellers.map((seller) => (
                <tr key={seller._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border text-gray-800">{seller.name}</td>
                  <td className="px-4 py-2 border text-gray-800">{seller.email}</td>
                  <td className="px-4 py-2 border text-gray-800">{seller.phone}</td>
                  <td className="px-4 py-2 border text-gray-800">{seller.companyName}</td>
                  <td className="px-4 py-2 border text-gray-800">{seller.registrationNumber}</td>
                  <td className="px-4 py-2 border text-gray-800">{seller.address}</td>
                  <td className="px-4 py-2 border text-gray-800">{seller.pincode}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-600">No sellers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md mr-2"
        >
          Previous
        </button>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage * itemsPerPage >= filteredSellers.length}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SellerManagement;
