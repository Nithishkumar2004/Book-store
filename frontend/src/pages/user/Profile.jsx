  // Profile.jsx
  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { useAuth } from '../../context/AuthContext'; // Assuming this is where your auth context is defined
  import { useSnackbar } from 'notistack'; // Importing useSnackbar from notistack
  import Loading from '../../components/loading';
import Endpoint from '../../Endpoint/Endpoint';

  const Profile = () => {
    const [userData, setUserData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setloading] = useState(true);
    const [error, setError] = useState(null);
    const { authToken } = useAuth(); // Assuming authToken is managed via context
    const { enqueueSnackbar } = useSnackbar(); // Using useSnackbar for notifications

    useEffect(() => {
      const fetchUserData = async () => {

        try {
          const response = await axios.get(`${Endpoint}user/profile`, {
            headers: {
              withCredentials: true,  // Allow sending cookies

              'X-Auth-Token': authToken,  // Send token in a custom header
            },
          });
          
          
          setUserData(response.data);
          setFormData(response.data); // Initialize formData with fetched userData
          setloading(false);
        } catch (err) {
          setError(err.response ? err.response.data.message : err.message);
          setloading(false);
        }
      };

      if (authToken) {
        fetchUserData();
      }
    }, [authToken]);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

    const handleUpdate = async () => {
      try {
        setloading(true);
        setError(null);
        const response = await axios.put(
          `${Endpoint}user/profile`,  // The API endpoint
          formData,  // The data you're sending in the request body
          {
            headers: {
              'X-Auth-Token': authToken,  // Send token in a custom header
              'Content-Type': 'application/json',  // Ensure the server knows the content type
            },
          }
        );
        

        setUserData(response.data.user);
        setEditMode(false);
        enqueueSnackbar('Profile updated successfully', { variant: 'success' });
      } catch (err) {
        const errorMsg = err.response ? err.response.data.message : err.message;
        setError(errorMsg);
        enqueueSnackbar(`Error: ${errorMsg}`, { variant: 'error' });
      } finally {
        setloading(false);
      }
    };

    const formatDate = (dateString) => {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(dateString));
    };

    if (loading) {
      return <Loading/>; // Render the loading component if still fetching data
    }

    if (error) {
      return <div>Error: {error}</div>;
    }

    return (
      <div className="max-w-2xl mx-auto p-4 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
        {userData ? (
          <div className="space-y-6">
            {editMode ? (
              <div className="space-y-4">
                {Object.entries(formData).map(([key, value]) => (
                  key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt' && (
                    <div key={key} className="flex justify-between">
                      <label className=" font-medium text-gray-600 min-w-32">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                      <input
                        type="text"
                        name={key}
                        value={formData[key] || ''}
                        onChange={handleChange}
                        className="ml-8 border p-2 rounded w-full"
                      />
                    </div>
                  )
                ))}
                <button onClick={handleUpdate} className="bg-blue-500 text-white p-2 rounded mt-4">Save Changes</button>
                <button onClick={() => setEditMode(false)} className="bg-gray-500 text-white p-2 rounded mt-4 ml-2">Cancel</button>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(userData).map(([key, value]) => (
                  key !== '_id' && key !== '__v' && (
                    <div key={key} className="flex justify-between">
                      <dt className="font-medium text-gray-600">{key.charAt(0).toUpperCase() + key.slice(1)}</dt>
                      <dd className="text-gray-800">
                        {key === 'createdAt' || key === 'updatedAt' ? formatDate(value) : value}
                      </dd>
                    </div>
                  )
                ))}
                <button onClick={() => setEditMode(true)} className="bg-blue-500 text-white p-2 rounded mt-4">Edit Profile</button>
              </div>
            )}
          </div>
        ) : (
          <div>No user data available.</div>
        )}
      </div>
    );
  };

  export default Profile;
