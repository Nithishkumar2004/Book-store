import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Axios for making HTTP requests
import Endpoint from '../../Endpoint/Endpoint';

const UserManagement = () => {
  // State to store the users data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  // Fetch users data on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userResponse = await axios.get(`${Endpoint}admin/users`); // Adjust the API endpoint if needed

        // Update the state with fetched data
        setUsers(userResponse.data.users);
        setFilteredUsers(userResponse.data.users);
        console.log(userResponse);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      
      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 shadow-md">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Email</th>
              <th className="px-4 py-2 border">Phone</th>
              <th className="px-4 py-2 border">Gender</th>
              <th className="px-4 py-2 border">Age</th>
              <th className="px-4 py-2 border">Address</th>
              <th className="px-4 py-2 border">Pincode</th>
              <th className="px-4 py-2 border">Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 border text-gray-800">{user.name}</td>
                  <td className="px-4 py-2 border text-gray-800">{user.email}</td>
                  <td className="px-4 py-2 border text-gray-800">{user.phone}</td>
                  <td className="px-4 py-2 border text-gray-800">{user.gender}</td>
                  <td className="px-4 py-2 border text-gray-800">{user.age}</td>
                  <td className="px-4 py-2 border text-gray-800">{user.address}</td>
                  <td className="px-4 py-2 border text-gray-800">{user.pincode}</td>
                  <td className="px-4 py-2 border text-gray-800">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-600">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
