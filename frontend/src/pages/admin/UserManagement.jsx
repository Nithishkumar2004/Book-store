import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Axios for making HTTP requests
import Endpoint from '../../Endpoint/Endpoint';

const UserManagement = () => {
  // State to store the users and sellers data
  const [users, setUsers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling

  // Fetch users and sellers data on component mount
  useEffect(() => {
    const fetchUsersAndSellers = async () => {
      try {
        const userResponse = await axios.get(`${Endpoint}/user/users`); // Adjust the API endpoint if needed
        const sellerResponse = await axios.get(`${Endpoint}/seller/sellers`); // Adjust the API endpoint if needed

        // Update the state with fetched data
        setUsers(userResponse.data.users);
        setSellers(sellerResponse.data.sellers);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndSellers();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>User Management</h1>

      <h2>Users</h2>
      <ul>
        {users.length > 0 ? (
          users.map((user) => (
            <li key={user._id}>
              {user.name} - {user.email}
            </li>
          ))
        ) : (
          <p>No users found</p>
        )}
      </ul>

      <h2>Sellers</h2>
      <ul>
        {sellers.length > 0 ? (
          sellers.map((seller) => (
            <li key={seller._id}>
              {seller.name} - {seller.shopName}
            </li>
          ))
        ) : (
          <p>No sellers found</p>
        )}
      </ul>
    </div>
  );
};

export default UserManagement;
