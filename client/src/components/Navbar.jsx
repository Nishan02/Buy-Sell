// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// FIX: I added FaStore to this list so the error will vanish
import { FaSearch, FaUserCircle, FaStore } from 'react-icons/fa'; 

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to home with the search query
      navigate(`/?search=${searchTerm}`);
    } else {
      navigate('/');
    }
  };

  const isLoggedIn = !!token;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 1. TOP LEFT: App Icon & Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center text-2xl font-bold text-indigo-600">
              {/* This icon caused the crash before. It works now. */}
              <FaStore className="h-8 w-8 mr-2" />
              Campus<span className="text-gray-800">Mart</span>
            </Link>
          </div>

          {/* 2. MIDDLE: Search Bar */}
         <form 
            onSubmit={handleSearch} 
            className="flex-1 max-w-2xl mx-4 lg:mx-8 hidden md:block"
          >
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                setSearchTerm(e.target.value)
                navigate(`/?search=${e.target.value}`);
              }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                placeholder="Search for books, cycles, electronics..."
              />
            </div>
          </form>

          {/* 3. TOP RIGHT: Account Section */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out"
                  >
                    <FaUserCircle className="h-9 w-9 text-gray-600" />
                  </button>
                </div>
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</Link>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Listings</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-gray-700 font-medium hover:text-indigo-600 px-3 py-2 rounded-md text-sm">Log in</Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition shadow-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Search Bar (Small Screens Only) */}
      <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </span>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
              placeholder="Search..."
            />
          </div>
      </div>
    </nav>
  );
};

export default Navbar;