import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Endpoint from '../../Endpoint/Endpoint';

const Orders = () => {
  const [orders, setOrders] = useState([]); // Orders data
  const [books, setBooks] = useState([]); // Books data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(''); // Error state
  const { authToken } = useAuth(); // Authentication token
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Track expanded orders

  const statusSequence = ['Pending', 'Shipped', 'Delivered']; // Define the status progression (Cancelled is outside this sequence)
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

      if (response.data && response.data.orders) {
        setOrders(response.data.orders);
      } else {
        setError('No orders data found');
      }

      if (response.data.books) {
        setBooks(response.data.books);
      }

      setLoading(false);
    } catch (err) {
      setError('Error fetching orders: ' + err.message);
      setLoading(false);
    }
  };
  useEffect(() => {
  

    fetchOrders();
  }, [authToken,]);

  const toggleExpandOrder = (orderId) => {
    setExpandedOrderId((prevId) => (prevId === orderId ? null : orderId));
  };

  const getBookDetails = (bookId) => {
    return books.find((book) => book._id === bookId);
  };

  const updateStatus = async (orderId, currentStatus) => {
    const currentIndex = statusSequence.indexOf(currentStatus);
    const nextStatus = statusSequence[currentIndex + 1]; // Get the next status in the sequence

    if (!nextStatus) return; // If there's no next status, do nothing

    try {
      const response = await axios.patch(
        `${Endpoint}order/update/${orderId}`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.data.success) {
        // Update the status in the UI
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, status: nextStatus } : order
          )
        );
      }
      fetchOrders();

    } catch (err) {
      setError('Error updating status: ' + err.message);
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
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">View More</th>
              
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <React.Fragment key={order._id}>
                {/* Main order row */}
                <tr className="border-b border-gray-200">
                  <td className="px-4 py-2">{order._id}</td>
                  <td className="px-4 py-2">
                    {order.status === 'Cancelled' ? (
                      <span className="text-red-600 font-semibold">Cancelled</span>
                    ) : (
                      order.status
                    )}
                  </td>
                  <td className="px-4 py-2">₹{order.totalAmount}</td>
                  <td className="px-4 py-2">{order.shippingAddress}</td>
                  <td className="px-4 py-2">{order.items.length} item(s)</td>
                  <td className="px-4 py-2 flex space-x-4">
                    {/* Button to update status */}
                    {order.status === 'Cancelled' ? (
                      <span className="text-red-600 font-semibold">Order Cancelled</span>
                    ) : (
                      <button
                        onClick={() => updateStatus(order._id, order.status)}
                        disabled={statusSequence.indexOf(order.status) === statusSequence.length - 1}
                        className="px-4 py-2 bg-blue-500 text-black rounded-lg disabled:bg-blue-50"
                      >
                        {statusSequence.indexOf(order.status) === statusSequence.length - 1
                          ? 'Order Delivered'
                          : 'Update Status'}
                      </button>
                    )}

                  
                  </td>
                  <td>
                      {/* Button to toggle expand order details */}
                      <button
                      onClick={() => toggleExpandOrder(order._id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg"
                    >
                      {expandedOrderId === order._id ? 'Hide Details' : 'Show Details'}
                    </button>
                  </td>
                </tr>

                {/* Expanded order details (sub-row) */}
                {expandedOrderId === order._id && (
                  <tr className="bg-gray-50">
                    <td colSpan="6" className="px-4 py-2">
                      <div className="space-y-4">
                        {/* Add headers for sub-row */}
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 font-semibold text-gray-700">
                          <div className="truncate">Book Image</div>
                          <div className="truncate">Book Title</div>
                          <div className="truncate">Book ID</div>
                          <div className="truncate">Quantity</div>
                          <div className="truncate">Price</div>
                        </div>

                        {order.items.map((item) => {
                          const book = getBookDetails(item.bookId);
                          return (
                            <div
                              key={item._id}
                              className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center py-4 border-b border-gray-200"
                            >
                              {/* Book image and details */}
                              <div className="flex items-center justify-center">
                                {book && book.bookImage ? (
                                  <img
                                    src={book.bookImage}
                                    alt={book.title}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded-lg">
                                    <span className="text-gray-400">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div>{book ? book.bookName : 'N/A'}</div>
                              <div className="truncate">{item.bookId}</div> {/* Ensure Book ID doesn't overflow */}
                              <div>{item.quantity}</div>
                              <div>₹{item.price}</div>
                            </div>
                          );
                        })}
                      </div>
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
