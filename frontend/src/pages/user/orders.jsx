import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Endpoint from '../../Endpoint/Endpoint';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // Import navigation hook

const Order = () => {
  const [cart, setCart] = useState([]); // To store cart items
  const [totalPrice, setTotalPrice] = useState(0); // To store total price
  const [loadingCart, setLoadingCart] = useState(true); // Loading state for cart
  const [loadingOrders, setLoadingOrders] = useState(true); // Loading state for past orders
  const [orderStatus, setOrderStatus] = useState(''); // To handle order status (e.g., placing, placed, failed)
  const [pastOrders, setPastOrders] = useState([]); // To store past orders
  const [showModal, setShowModal] = useState(false); // To control modal visibility
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
      fetchedCart.forEach((item) => {
        total += item.quantity * item.book.price;
      });
      setTotalPrice(total);
      setLoadingCart(false); // Set loadingCart to false when cart is fetched
    } catch (error) {
      console.error('Failed to fetch cart items:', error);
      setLoadingCart(false); // Set loadingCart to false in case of an error
    }
  };

  // Function to fetch past orders
  const fetchPastOrders = async () => {
    try {
      const response = await axios.get(`${Endpoint}user/orders`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setPastOrders(response.data.orders); // Assuming response contains a list of past orders
      setLoadingOrders(false); // Set loadingOrders to false when past orders are fetched
    } catch (error) {
      setLoadingOrders(false); // Set loadingOrders to false in case of an error
      console.log(error);
      
    }
  };

  // Function to handle placing the order
  const handlePlaceOrder = async () => {
    setShowModal(false);

    const orderItems = cart.map((item) => ({
      bookId: item.book._id,  // Passing bookId
      quantity: item.quantity,  // Passing quantity
      price: item.book.price,  // Passing price
    }));

    const orderData = {
      items: orderItems,
      totalPrice: totalPrice,  // Updating totalPrice field
      shippingAddress: "Dummy Address", // You can replace this with an actual address input if needed
    };
    console.log(orderData); // Log orderData to see the structure before sending it to the backend

    try {
      setOrderStatus('placing');
      const response = await axios.post(`${Endpoint}order/create`, orderData, {
        headers: { Authorization: `Bearer ${authToken}` }, // Pass authToken in headers for authentication
      });

      if (response.status === 200) {
        setOrderStatus('placed');
        setCart([]); // Clear the cart after the order is placed
        setTotalPrice(0);
        setShowModal(false); // Close modal after order is placed
      } else {
        setOrderStatus('failed');
        console.error('Failed to place the order:', response.data.message);
      }
    } catch (error) {
      setOrderStatus('failed');
      console.error('Error placing order:', error);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchPastOrders(); // Fetch past orders when the page loads
  }, []); // Empty dependency array ensures this runs only once when the component is mounted

  // Return loading state while cart or past orders are being fetched
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
              {cart.map((item) => (
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
                  <td className="py-2 px-4">₹{item.book.price.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    ₹{(item.quantity * item.book.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 text-right">
        <h3 className="text-xl font-semibold">Total Price: ₹{totalPrice.toFixed(2)}</h3>
        <button
          onClick={() => setShowModal(true)} // Show modal when clicked
          className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Place Order
        </button>
        {orderStatus === 'failed' && (
          <p className="text-red-500 mt-2">Failed to place the order. Please try again.</p>
        )}
        {orderStatus === 'placed' && (
          <p className="text-green-500 mt-2">Order placed successfully!</p>
        )}
      </div>

      {/* Past Orders Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold">Your Past Orders</h3>
        {pastOrders.length === 0 ? (
          <p>No past orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Order ID</th>
                  <th className="py-2 px-4 border-b text-left">Date</th>
                  <th className="py-2 px-4 border-b text-left">Total Amount</th>
                  <th className="py-2 px-4 border-b text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {pastOrders.map((order) => (
                  <tr key={order._id} className="border-b">
                    <td className="py-2 px-4">{order._id}</td>
                    <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 px-4">₹{order.totalPrice.toFixed(2)}</td>
                    <td className="py-2 px-4">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Order Confirmation */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Confirm Your Order</h2>
            <p className="mb-4">Are you sure you want to place this order?</p>
            <div className="flex justify-between">
              <button
                onClick={() => setShowModal(false)} // Close modal without placing order
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceOrder} // Place the order and close modal
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
