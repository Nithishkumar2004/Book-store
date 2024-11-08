import React, { useState } from 'react';
import axios from 'axios';
import { FaLock, FaUser, FaEnvelope, FaPhone, FaEye, FaEyeSlash, FaMapMarkerAlt } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';

const SellerSignupForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    companyName: '',
    registrationNumber: '',
    address: '',
    pincode: '',
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation checks
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phone ||
      !formData.companyName ||
      !formData.registrationNumber ||
      !formData.address ||
      !formData.pincode
    ) {
      enqueueSnackbar('All fields are required!', { variant: 'error' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match!', { variant: 'error' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/seller/register', formData);
      enqueueSnackbar('Seller registration completed successfully', { variant: 'success' });
      navigate("/login/seller")
      
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      } else {
        enqueueSnackbar('Error submitting form.', { variant: 'error' });
      }
    }
  };

  return (
    <div className="mx-auto bg-white p-6 rounded-lg shadow-lg mt-10 max-w-xl">
      <h2 className="text-2xl font-semibold text-center mb-4">Seller Registration</h2>
      <form onSubmit={handleSubmit}>
        {/* Name Input */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Enter your name"
            />
          </div>
        </div>

        {/* Email Input */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <FaEnvelope className="text-gray-400 mr-2" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Enter your email"
            />
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <FaPhone className="text-gray-400 mr-2" />
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Company Name Input */}
        <div className="mb-4">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Enter your company name"
            />
          </div>
        </div>

        {/* Registration Number Input */}
        <div className="mb-4">
          <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700">Registration Number</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <input
              type="text"
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Enter your registration number"
            />
          </div>
        </div>

        {/* Address Input */}
        <div className="mb-4">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <FaMapMarkerAlt className="text-gray-400 mr-2" />
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Enter your address"
            />
          </div>
        </div>

        {/* Pincode Input */}
        <div className="mb-4">
          <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <input
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Enter your pincode"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Enter your password"
            />
            <button type="button" onClick={togglePasswordVisibility} className="text-gray-400">
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Confirm Password Input */}
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type={confirmPasswordVisible ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full bg-transparent outline-none"
              placeholder="Confirm your password"
            />
            <button type="button" onClick={toggleConfirmPasswordVisibility} className="text-gray-400">
              {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
          Register Seller
        </button>
      </form>
    </div>
  );
};

export default SellerSignupForm;
