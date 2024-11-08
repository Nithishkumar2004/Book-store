import React, { useState } from 'react';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginForm = () => {
  const { userType } = useParams();  // Extract userType from the URL parameter
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  // Redirect to appropriate home page if already authenticated
  if (isAuthenticated) {
    if (userType === 'user') {
      return <Navigate to="/home" />;
    } else if (userType === 'seller') {
      return <Navigate to="/seller/home" />;
    } else if (userType === 'admin') {
      return <Navigate to="/admin/dashboard" />;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine the login endpoint based on the user type
    let endpoint;
    switch (userType) {
      case 'user':
        endpoint = 'http://localhost:3000/user/login';
        break;
      case 'seller':
        endpoint = 'http://localhost:3000/seller/login';
        break;
      case 'admin':
        endpoint = 'http://localhost:3000/admin/login';
        break;
      default:
        endpoint = 'http://localhost:3000/user/login';
    }

    try {
      const response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password,
      });
      const token = response.data.token;
      login(token, userType);
      enqueueSnackbar('Login successful!', { variant: 'success' });

      // Navigate based on user type
      if (userType === 'user') {
        navigate('/home');
      } else if (userType === 'seller') {
        navigate('/seller/home');
      } else if (userType === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      enqueueSnackbar(`Error during login: ${errorMessage}`, { variant: 'error' });
      console.error('Error during login:', errorMessage);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 uppercase">{userType} LOGIN</h1>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="flex items-center border rounded-md px-3 py-2 bg-gray-100">
              <FaLock className="text-gray-400 mr-2" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold"
          >
            Log in
          </button>

          {userType === 'admin' ? null : (
            <div className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a href={`/signup/${userType}`} className="text-blue-600 hover:text-blue-700">
                Signup
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
