import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Endpoint from '../../Endpoint/Endpoint';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { authToken } = useAuth();
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Track which order is expanded

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = authToken;

        if (!token) {
          setError('Authorization token is missing');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${Endpoint}seller/orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrders(response.data.orders);
        
        setLoading(false);
      } catch (err) {
        setError('Error fetching orders: ' + err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, [authToken]);

  // Toggle expanded state for orders
  const toggleExpandOrder = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null); // Collapse if clicked on the same order
    } else {
      setExpandedOrderId(orderId); // Expand if clicked on a different order
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Your Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-xl">No orders found</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Order ID</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Total Amount</th>
              <th className="px-4 py-2 text-left">Shipping Address</th>
              <th className="px-4 py-2 text-left">Items</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                {/* Main order row */}
                <tr className="border-b border-gray-200 cursor-pointer" onClick={() => toggleExpandOrder(order._id)}>
                  <td className="px-4 py-2">{order._id}</td>
                  <td className="px-4 py-2">{order.status}</td>
                  <td className="px-4 py-2">₹{order.totalAmount}</td>
                  <td className="px-4 py-2">{order.shippingAddress}</td>
                  <td className="px-4 py-2">{order.items.length} item(s)</td>
                </tr>

                {/* Sub-row for items (only visible if the order is expanded) */}
                {expandedOrderId === order._id && (
                  <tr>
                    <td colSpan="5" className="px-4 py-2 bg-gray-50">
                      <table className="w-full border-t border-gray-200">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="px-4 py-2 text-left">Book Name</th>
                            <th className="px-4 py-2 text-left">Quantity</th>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Total Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="px-4 py-2">{item.bookId?.name || 'Unknown'}</td>
                              <td className="px-4 py-2">{item.quantity}</td>
                              <td className="px-4 py-2">₹{item.price}</td>
                              <td className="px-4 py-2">₹{item.price * item.quantity}</td>
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
      )}
    </div>
  );
};

export default Orders;
