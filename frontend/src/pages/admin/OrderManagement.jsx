import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Endpoint from '../../Endpoint/Endpoint';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);  // State to store orders
  const [loading, setLoading] = useState(true);  // State to track loading
  const [error, setError] = useState(null);  // State for errors
  const [expandedRows, setExpandedRows] = useState({});  // Track which rows are expanded

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${Endpoint}admin/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`  // Using token for authentication
          }
        });
        setOrders(response.data.orders);  // Set fetched orders to state
      } catch (err) {
        setError('An error occurred while fetching orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Toggle row expansion for sub-items (order items)
  const toggleRowExpansion = (orderId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],  // Toggle the expanded state of the specific order
    }));
  };

  if (loading) {
    return <div>Loading orders...</div>;  // Show loading state
  }

  if (error) {
    return <div>{error}</div>;  // Show error if there is one
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Order Management</h1>
      {orders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">Order ID</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
                <th className="py-2 px-4 border-b text-left">Total Amount</th>
                <th className="py-2 px-4 border-b text-left">Shipping Address</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{order._id}</td>
                    <td className="py-2 px-4 border-b">{order.status}</td>
                    <td className="py-2 px-4 border-b">₹{order.totalAmount}</td>
                    <td className="py-2 px-4 border-b">{order.shippingAddress}</td>
                    <td className="py-2 px-4 border-b">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => toggleRowExpansion(order._id)}
                      >
                        {expandedRows[order._id] ? 'Hide Items' : 'Show Items'}
                      </button>
                    </td>
                  </tr>
                  {/* Sub-row for order items */}
                  {expandedRows[order._id] && (
                    <tr>
                      <td colSpan="5" className="py-2 px-4 bg-gray-50">
                        <table className="w-full table-auto">
                          <thead>
                            <tr>
                              <th className="py-2 px-4 text-left">Book</th>
                              <th className="py-2 px-4 text-left">Quantity</th>
                              <th className="py-2 px-4 text-left">Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item, index) => (
                              <tr key={index} className="hover:bg-gray-100">
                                <td className="py-2 px-4">{item.bookDetails.name}</td>
                                <td className="py-2 px-4">{item.quantity}</td>
                                <td className="py-2 px-4">₹{item.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
