// src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUserCircle, FaStore, FaHistory, FaTrashAlt } from 'react-icons/fa';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      // 1. Update History in LocalStorage
      const existingHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updatedHistory = [
        searchTerm.trim(),
        ...existingHistory.filter(term => term !== searchTerm.trim())
      ].slice(0, 5);

      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);

      // 2. Navigate
      navigate(`/?search=${searchTerm}`);
      setShowHistory(false);
    }
  };

  const handleFocus = () => {
    const saved = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setHistory(saved);
    setShowHistory(true);
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    localStorage.removeItem('searchHistory');
    setHistory([]);
  };

  const isLoggedIn = !!token;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          {/* 1. TOP LEFT: App Icon & Name */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center text-2xl font-bold text-indigo-600">
              <FaStore className="h-8 w-8 mr-2" />
              Campus<span className="text-gray-800">Mart</span>
            </Link>
          </div>

          {/* 2. MIDDLE: Search Bar with History Dropdown */}
          <div className="flex-1 max-w-2xl mx-4 lg:mx-8 hidden md:block relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onFocus={handleFocus}
                  onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    navigate(`/?search=${e.target.value}`);
                  }}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm"
                  placeholder="Search for books, cycles, electronics..."
                />
              </div>
            </form>

            {/* History Dropdown */}
            {/* History Dropdown */}
{showHistory && history.length > 0 && (
  <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden">
    
    {/* History Items */}
    <div className="py-1">
      {history.map((term, index) => (
        <button
          key={index}
          onMouseDown={() => {
            setSearchTerm(term);
            navigate(`/?search=${term}`);
          }}
          className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-indigo-50 flex items-center transition"
        >
          <FaHistory className="mr-3 text-gray-300 text-xs" />
          {term}
        </button>
      ))}
    </div>

    {/* Small Clear Button on the Left */}
    <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-start">
      <button 
        onMouseDown={(e) => {
          e.preventDefault(); 
          localStorage.removeItem('searchHistory');
          setHistory([]);
        }}
        className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition flex items-center"
      >
        <FaTrashAlt className="mr-1" /> Clear History
      </button>
    </div>
  </div>
)}
          </div>

          {/* 3. TOP RIGHT: Account Section */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <div className="relative ml-3">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition"
                >
                  <FaUserCircle className="h-9 w-9 text-gray-600" />
                </button>

                {isDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="py-1">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Your Profile</Link>
                      <Link to="/my-listings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Listings</Link>
                      <hr className="my-1 border-gray-100" />
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-medium">Sign out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex space-x-3">
                <Link to="/login" className="text-gray-700 font-medium hover:text-indigo-600 px-3 py-2 text-sm">Log in</Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-md">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              navigate(`/?search=${e.target.value}`);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 sm:text-sm"
            placeholder="Search..."
          />
        </form>
      </div>
    </nav>
  );
};

export default Navbar;