// SellerProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed
import { useSnackbar } from 'notistack'; // For notifications
import Loading from '../../components/loading';
import Endpoint from '../../Endpoint/Endpoint';

const SellerProfile = () => {
  const [sellerData, setSellerData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useAuth(); // Assuming authToken is managed via context
  const { enqueueSnackbar } = useSnackbar(); // Snackbar for notifications

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await axios.get(`${Endpoint}seller/profile`, {
          headers: {
            'X-Auth-Token': authToken, // Send token in a custom header
          },
        });
        
        setSellerData(response.data.seller);
        setFormData(response.data.seller); // Initialize formData with fetched sellerData
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data.message : err.message);
        setLoading(false);
      }
    };

    if (authToken) {
      fetchSellerData();
    }
  }, [authToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put(
        `${Endpoint}seller/profile`, // The API endpoint
        formData, // The data you're sending in the request body
        {
          headers: {
            'X-Auth-Token': authToken, // Send token in a custom header
            'Content-Type': 'application/json', // Ensure the server knows the content type
          },
        }
      );

      setSellerData(response.data.seller);
      setEditMode(false);
      enqueueSnackbar('Profile updated successfully', { variant: 'success' });
    } catch (err) {
      const errorMsg = err.response ? err.response.data.message : err.message;
      setError(errorMsg);
      enqueueSnackbar(`Error: ${errorMsg}`, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />; // Render the loading component if still fetching data
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Seller Profile Information</h2>
      {sellerData ? (
        <div className="space-y-4">
          {editMode ? (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <div>
                <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>

              <button
                onClick={handleUpdate}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md shadow-md"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="mt-4 ml-2 px-4 py-2 bg-gray-500 text-white rounded-md shadow-md"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <p><strong>Name:</strong> {sellerData.name}</p>
              <p><strong>Email:</strong> {sellerData.email}</p>
              <p><strong>Phone:</strong> {sellerData.phone}</p>
              <p><strong>Company Name:</strong> {sellerData.companyName}</p>
              <p><strong>Address:</strong> {sellerData.address}</p>
              <p><strong>Pincode:</strong> {sellerData.pincode}</p>
              <p><strong>Registration Number:</strong> {sellerData.registrationNumber}</p>
              <button
                onClick={() => setEditMode(true)}
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md shadow-md"
              >
                Edit Profile
              </button>
            </>
          )}
        </div>
      ) : (
        <p>No seller data available.</p>
      )}
    </div>
  );
};

export default SellerProfile;
