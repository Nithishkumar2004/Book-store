import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Endpoint from '../../Endpoint/Endpoint';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FaTimes } from 'react-icons/fa'; // Importing red cross icon from react-icons

const Order = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [cart, setCart] = useState([]); // To store cart items
  const [totalPrice, setTotalPrice] = useState(0); // To store total price
  const [loadingCart, setLoadingCart] = useState(true); // Loading state for cart
  const [loadingOrders, setLoadingOrders] = useState(true); // Loading state for past orders
  const [orderStatus, setOrderStatus] = useState(''); // To handle order status (e.g., placing, placed, failed)
  const [bookDetails, setBookDetails] = useState([]); // To store book details separately
  const [pastOrders, setPastOrders] = useState([]); // To store past orders
  const [showModal, setShowModal] = useState(false); // To control modal visibility
  const [sameSeller, setSameSeller] = useState(true); // To track if all items are from the same seller
  const [expandedOrderId, setExpandedOrderId] = useState(null); // To track the expanded order for subrows
  const { authToken } = useAuth(); // Get authToken from context
  const navigate = useNavigate(); // Initialize navigate function

  // Function to fetch cart data
  const fetchCart = async () => {
    try {
      const response = await axios.get(`${Endpoint}user/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const fetchedCart = response.data.cart;

      setCart(fetchedCart);

      // Calculate total price
      let total = 0;
      let sellerId = null;

      fetchedCart.forEach((item) => {
        const price = item.book?.price || 0;
        const quantity = item.quantity || 0;
        total += quantity * price;

        if (sellerId === null) {
          sellerId = item.book?.sellerId._id; // Get the sellerId of the first item
        } else if (item.book?.sellerId._id !== sellerId) {
          setSameSeller(false); // If any item has a different sellerId, set to false
        }
      });

      setTotalPrice(total);
      setLoadingCart(false);
    } catch (error) {
      setLoadingCart(false);
    }
  };

  const fetchPastOrders = async () => {
    try {
      const response = await axios.get(`${Endpoint}user/orders`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setPastOrders(response.data.orders);
      setBookDetails(response.data.books); // Store book details separately
      setLoadingOrders(false);
    } catch (error) {
      console.error("Error fetching past orders:", error);
      setLoadingOrders(false);
    }
  };

  // Function to handle placing the order
  const handlePlaceOrder = async () => {
    setShowModal(false);
    if (!sameSeller) {
      enqueueSnackbar(`All items must belong to the same seller.`, { variant: 'error' });
      navigate(`/cart`);
      return; // Prevent order placement if items are from different sellers
    }

    const orderItems = cart.map((item) => ({
      bookId: item.book._id,
      quantity: item.quantity,
      price: item.book.price,
    }));

    const orderData = {
      items: orderItems,
      totalPrice: totalPrice,
      shippingAddress: "Dummy Address",
    };

    try {
      setOrderStatus('placing');
      const response = await axios.post(`${Endpoint}order/create`, orderData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      

      if (response.status === 200) {
        setOrderStatus('placed');
        await fetchPastOrders();
        enqueueSnackbar("Order Placed Successfully",{variant:'success'})

        setCart([]); // Clear the cart after the order is placed
        fetchPastOrders();
        setTotalPrice(0);
        setShowModal(false); // Close modal after order is placed
      } else {
        setOrderStatus('failed');
      }
    } catch (error) {
      setOrderStatus('failed');
    }
  };

  // Function to handle canceling an order
  const handleCancelOrder = async (orderId, status) => {
    if (status !== 'Pending') {
      enqueueSnackbar(`${status} orders cannot be canceled`, { variant: 'error' });
      return;
    }
  
    try {
      const response = await axios.patch(
        `${Endpoint}order/cancel/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
  
      if (response.status === 200) {
        enqueueSnackbar('Order canceled successfully', { variant: 'success' });
        // Re-fetch past orders to update the UI
        fetchPastOrders();
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      enqueueSnackbar('Failed to cancel the order', { variant: 'error' });
    }
  };
  


  
  // Toggle the expanded row for a specific order
  const handleToggleExpanded = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null); // Collapse if the same row is clicked
    } else {
      setExpandedOrderId(orderId); // Expand the clicked row
    }
  };

  useEffect(() => {
    fetchCart();
    fetchPastOrders();
  }, []); // Empty dependency array ensures this runs only once when the component is mounted

  if (loadingCart || loadingOrders) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Book Image</th>
                <th className="py-2 px-4 border-b text-left">Book Name</th>
                <th className="py-2 px-4 border-b text-left">Quantity</th>
                <th className="py-2 px-4 border-b text-left">Price</th>
                <th className="py-2 px-4 border-b text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => {
                const price = item.book?.price || 0;
                const total = (item.quantity || 0) * price;
                return (
                  <tr key={item._id} className="border-b">
                    <td className="py-2 px-4">
                      <img
                        src={item.book.bookImage}
                        alt={item.book.bookName}
                        className="w-20 h-20 object-cover"
                      />
                    </td>
                    <td className="py-2 px-4">{item.book.bookName}</td>
                    <td className="py-2 px-4">{item.quantity}</td>
                    <td className="py-2 px-4">₹{price.toFixed(2)}</td>
                    <td className="py-2 px-4">₹{total.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 text-right">
        <h3 className="text-xl font-semibold">Total Price: ₹{totalPrice.toFixed(2)}</h3>
        <button
          onClick={() => setShowModal(true)}
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Place Order
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Order</h3>
            <p>Are you sure you want to place this order?</p>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handlePlaceOrder}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Yes, Place Order
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

 {/* Past Orders Section */}
<div className="mt-8">
  <h3 className="text-xl font-bold">Your Past Orders</h3>
  {pastOrders.length === 0 ? (
    <p>No past orders found.</p>
  ) : (
    <div className="overflow-x-auto mt-4">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 border-b text-left">Order ID</th>
            <th className="py-2 px-4 border-b text-left">Date</th>
            <th className="py-2 px-4 border-b text-left">Total</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Action</th>
            <th className="py-2 px-4 border-b text-left">Cancel Order</th>
          </tr>
        </thead>
        <tbody>
          {pastOrders.map((order) => {
            const orderDate = new Date(order.orderDate);
            const formattedDate = `${orderDate.getDate()}/${orderDate.getMonth() + 1}/${orderDate.getFullYear()}`;
            const orderTotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return (
              <React.Fragment key={order._id}>
                <tr className="border-b">
                  <td className="py-2 px-4">{order._id}</td>
                  <td className="py-2 px-4">{formattedDate}</td>
                  <td className="py-2 px-4">₹{orderTotal.toFixed(2)}</td>
                  <td>{order.status}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleToggleExpanded(order._id)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {expandedOrderId === order._id ? 'Hide Details' : 'Show Details'}
                    </button>
                  </td>
                  <td>
                    {order.status !== 'shipped' ? (
                      <FaTimes
                        className="text-red-600 hover:text-red-800 cursor-pointer"
                        onClick={() => handleCancelOrder(order._id, order.status)}
                      />
                    ) : (
                      <span className="text-gray-500">Shipped - Cannot Cancel</span>
                    )}
                  </td>
                </tr>

                {expandedOrderId === order._id && (
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="py-2 px-4">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="py-2 px-4 border-b">Book Image</th>
                            <th className="py-2 px-4 border-b">Book Name</th>
                            <th className="py-2 px-4 border-b">Quantity</th>
                            <th className="py-2 px-4 border-b">Price</th>
                            <th className="py-2 px-4 border-b">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => {
                            const bookDetail = bookDetails.find(
                              (book) => book._id === item.bookId
                            );
                            const bookName = bookDetail ? bookDetail.bookName : 'Unknown';
                            const bookPrice = bookDetail ? bookDetail.price : 0;
                            const bookImage = bookDetail ? bookDetail.bookImage : ''; // Assuming imageUrl is the key for the image
                            const total = bookPrice * item.quantity;

                            return (
                              <tr key={item._id}>
                                <td className="py-2 px-4">
                                  {bookImage ? (
                                    <img
                                      src={bookImage}
                                      alt={bookName}
                                      className="w-12 h-12 object-cover"
                                    />
                                  ) : (
                                    <img
                                      src="/path/to/default-image.jpg" // Your default image path here
                                      alt="No Image"
                                      className="w-12 h-12 object-cover"
                                    />
                                  )}
                                </td>
                                <td className="py-2 px-4">{bookName}</td>
                                <td className="py-2 px-4">{item.quantity}</td>
                                <td className="py-2 px-4">₹{bookPrice.toFixed(2)}</td>
                                <td className="py-2 px-4">₹{total.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  )}
</div>

    </div>
  );
};

export default Order;
