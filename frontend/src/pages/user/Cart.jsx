import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Endpoint from '../../Endpoint/Endpoint';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa'; // Importing red cross icon from react-icons

const Cart = () => {
  const [cart, setCart] = useState([]); // To store cart items
  const [totalPrice, setTotalPrice] = useState(0); // To store total price
  const [loading, setLoading] = useState(true); // To handle loading state
  const { authToken } = useAuth();
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
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to update the quantity of an item
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Prevent reducing quantity to less than 1
    try {
      await axios.put(
        `${Endpoint}user/cart/${itemId}`,
        { quantity: newQuantity },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      fetchCart(); // Refresh the cart after updating
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Function to remove an item from the cart
  const removeItem = async (itemId) => {
    try {
      const response = await axios.delete(`${Endpoint}user/cart/item/`, {
        headers: { Authorization: `Bearer ${authToken}` },
        data: { itemId }, // Correctly sending the itemId in the body
      });
      fetchCart(); // Refresh the cart after removing
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Function to delete the entire cart
  const deleteCart = async () => {
    try {
      await axios.delete(`${Endpoint}user/cart`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      fetchCart(); // Refresh the cart after deleting
    } catch (error) {
      console.error("Error deleting cart:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []); // Fetch cart data on mount

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
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
                <th className="py-2 px-4 border-b text-left">Seller Company</th>
                <th className="py-2 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="py-2 px-4">
                    <img
                      src={item.book.bookImage}
                      onClick={() => navigate(`/purchase/${item.book._id}`)}
                      alt={item.book.bookName}
                      className="w-16 h-16 object-cover cursor-pointer"
                    />
                  </td>
                  <td className="py-2 px-4">{item.book.bookName}</td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={(e) => updateQuantity(item._id, parseInt(e.target.value))}
                      className="w-16 px-2 py-1 border rounded"
                    />
                  </td>
                  <td className="py-2 px-4">₹{item.book.price.toFixed(2)}</td>
                  <td className="py-2 px-4">
                    ₹{(item.quantity * item.book.price).toFixed(2)}
                  </td>
                  <td className="py-2 px-4">{item.book.sellerId.companyName}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes className="text-xl" /> {/* Using red cross icon */}
                    </button>
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
          onClick={() => navigate('/orders')}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Proceed to Checkout
        </button>
        <button
          onClick={deleteCart}
          className="mt-2 ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
};

export default Cart;
