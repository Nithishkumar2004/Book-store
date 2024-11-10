import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Header = ({ menuItems }) => {
  const [activeItem, setActiveItem] = useState("Home");
  const [isOpen, setIsOpen] = useState(false);
  const { authToken, logout,userType } = useAuth(); // Access auth token and logout function

  return (
    <header>
      <nav className="bg-header-background border-b border-header-border-color px-4 lg:px-6 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <NavLink to="/" className="text-header-text-color text-2xl">
            BookEase
          </NavLink>
          <div className="flex items-center lg:order-2 space-x-4">
            {authToken && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-header-text-color transition-colors duration-300"
                >
                  <FaSignOutAlt size={20} />
                  <span className="sr-only">Logout</span>
                </button>
                <NavLink 
                  to={`/${userType}/profile`}
                  className="text-gray-500 hover:text-header-text-color transition-colors duration-300"
                >
                  <FaUserCircle size={24} />
                  <span className="sr-only">Profile</span>
                </NavLink>
              </div>
            ) }
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu-2"
              aria-expanded={isOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div
            className={`${isOpen ? "block" : "hidden"} justify-between items-center w-full lg:flex lg:w-auto lg:order-1`}
            id="mobile-menu-2"
          >
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              {menuItems.map((item, index) => (
                <li key={index} className="relative">
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `block py-2 pr-4 pl-3 ${
                        isActive
                          ? "text-header-link-active bg-header-link-hover rounded lg:bg-transparent"
                          : "text-header-text-color hover:bg-header-link-hover"
                      } lg:p-0 transition-colors duration-300`
                    }
                    aria-current={activeItem === item.name ? "page" : undefined}
                    onClick={() => {
                      setActiveItem(item.name);
                      setIsOpen(false); // Close mobile menu on item click
                    }}
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
