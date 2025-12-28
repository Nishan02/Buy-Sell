import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaUserCircle, 
  FaStore, 
  FaHistory, 
  FaTrashAlt, 
  FaHeart, 
  FaPlus, 
  FaSignOutAlt, 
  FaUser, 
  FaList,
  FaBullhorn,
  FaCommentDots
} from 'react-icons/fa';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  
  // NEW: State for unread chat count
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  // NEW: Sync Unread Count logic
  useEffect(() => {
    const fetchUnreadCount = () => {
      // In a real app, you would fetch this from an API.
      // For now, we read the value set by the Chat Page in localStorage
      const count = parseInt(localStorage.getItem('campusMart_unreadCount') || '0');
      setUnreadChatCount(count);
    };

    fetchUnreadCount(); // Initial check

    // Listen for updates from the Chat page
    window.addEventListener('chat-update', fetchUnreadCount);
    return () => window.removeEventListener('chat-update', fetchUnreadCount);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      const existingHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const updatedHistory = [
        searchTerm.trim(),
        ...existingHistory.filter(term => term !== searchTerm.trim())
      ].slice(0, 5);

      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
      navigate(`/?search=${searchTerm.trim()}`);
      setShowHistory(false);
    }
  };

  const handleFocus = () => {
    const saved = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setHistory(saved);
    setShowHistory(true);
  };

  // Helper component for Nav Items
  const NavItem = ({ to, icon: Icon, label, badgeCount, className = "" }) => (
    <Link 
      to={to} 
      className={`relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 group ${className}`}
    >
       <Icon className="text-lg group-hover:scale-110 transition-transform text-gray-400 group-hover:text-indigo-600" />
       <span className="hidden xl:block">{label}</span>
       
       {/* Badge Logic */}
       {badgeCount > 0 && (
         <span className="absolute top-1 right-1 xl:top-0 xl:right-auto xl:left-6 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white ring-2 ring-white transform -translate-y-1/2 translate-x-1/2 xl:translate-x-0">
           {badgeCount}
         </span>
       )}
    </Link>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[95rem] mx-auto">
        <div className="flex justify-between h-20 items-center gap-4">

          {/* 1. LEFT: Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer min-w-fit" onClick={() => navigate('/')}>
            <div className="flex items-center text-2xl font-black text-indigo-600 tracking-tight">
              <FaStore className="h-8 w-8 mr-2.5" />
              <span>Campus<span className="text-gray-900">Mart</span></span>
            </div>
          </div>

          {/* 2. MIDDLE: Search Bar */}
          <div className="flex-1 max-w-2xl px-4 lg:px-8 hidden md:block relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onFocus={handleFocus}
                  onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-full leading-5 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm hover:bg-white hover:shadow-md"
                  placeholder="Search for books, cycles, electronics..."
                />
              </div>
            </form>

            {/* History Dropdown */}
            {showHistory && history.length > 0 && (
              <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[60] overflow-hidden">
                <div className="py-2">
                  <div className="px-4 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Recent Searches</div>
                  {history.map((term, index) => (
                    <button
                      key={index}
                      onMouseDown={() => {
                        setSearchTerm(term);
                        navigate(`/?search=${term}`);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 flex items-center transition-colors font-medium"
                    >
                      <FaHistory className="mr-3 text-indigo-300" />
                      {term}
                    </button>
                  ))}
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 flex justify-end">
                  <button 
                    onMouseDown={(e) => {
                      e.preventDefault(); 
                      localStorage.removeItem('searchHistory');
                      setHistory([]);
                    }}
                    className="text-xs font-bold text-red-500 hover:text-red-700 transition flex items-center px-2 py-1 rounded hover:bg-red-50"
                  >
                    <FaTrashAlt className="mr-1.5" /> Clear History
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. RIGHT: Actions */}
          <div className="flex items-center gap-1 lg:gap-3 flex-shrink-0">
            
            <NavItem to="/wishlist" icon={FaHeart} label="Wishlist" />
            <NavItem to="/lost-and-found" icon={FaBullhorn} label="Lost & Found" />

            <Link
              to="/sell"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 border border-transparent text-sm font-bold rounded-full shadow-lg text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-0.5 mx-2"
            >
              <FaPlus className="text-xs" />
              Sell Item
            </Link>

            {/* UPDATED: Chat Icon with Badge */}
            <NavItem 
              to="/chats" 
              icon={FaCommentDots} 
              label="Chats" 
              badgeCount={unreadChatCount} // Pass the dynamic count
            />

            <div className="h-8 w-px bg-gray-200 mx-2 hidden lg:block"></div>

            {token ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                   {user && user.profilePic ? (
                      <img className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-sm" src={user.profilePic} alt="" />
                  ) : (
                      <FaUserCircle className="h-9 w-9 text-gray-400" />
                  )}
                  
                  <div className="hidden lg:flex flex-col items-start mr-1">
                      <span className="text-sm font-bold text-gray-700 leading-none">{user?.name?.split(' ')[0] || 'User'}</span>
                      <span className="text-[10px] font-medium text-gray-400 leading-none mt-0.5">My Profile</span>
                  </div>
                </button>

                {isDropdownOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-3 w-64 rounded-2xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform transition-all"
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-white">
                        <p className="text-xs text-indigo-500 uppercase tracking-wider font-bold mb-1">Signed in as</p>
                        <p className="text-sm font-black text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="py-2">
                      <Link to="/profile" className="group flex items-center px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                        <FaUser className="mr-3 text-gray-400 group-hover:text-indigo-500" /> Your Profile
                      </Link>
                      <Link to="/my-listings" className="group flex items-center px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                        <FaList className="mr-3 text-gray-400 group-hover:text-indigo-500" /> My Listings
                      </Link>
                      
                      <div className="lg:hidden border-t border-gray-100 my-1">
                          <Link to="/wishlist" className="group flex items-center px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-pink-600">
                            <FaHeart className="mr-3 text-gray-400 group-hover:text-pink-500" /> Wishlist
                          </Link>
                          <Link to="/lost-and-found" className="group flex items-center px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600">
                            <FaBullhorn className="mr-3 text-gray-400 group-hover:text-indigo-500" /> Lost & Found
                          </Link>
                          <Link to="/chats" className="group flex items-center px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-indigo-600">
                            <FaCommentDots className="mr-3 text-gray-400 group-hover:text-indigo-500" /> Chats
                            {unreadChatCount > 0 && <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadChatCount}</span>}
                          </Link>
                      </div>

                      <div className="border-t border-gray-100 my-1"></div>
                      <button onClick={handleLogout} className="w-full text-left group flex items-center px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <FaSignOutAlt className="mr-3 text-red-400 group-hover:text-red-500" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 font-bold hover:text-indigo-600 px-4 py-2 text-sm transition-colors">Log in</Link>
                <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden px-4 pb-4 border-t border-gray-100 pt-3">
        <form onSubmit={handleSearch} className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
            placeholder="Search..."
          />
        </form>
      </div>
    </nav>
  );
};

export default Navbar;