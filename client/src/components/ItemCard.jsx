import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { FaHeart, FaRegHeart, FaCommentDots } from 'react-icons/fa'; 
import API from '../api/axios'; 

// 1. IMPORT Toast
import { toast } from 'react-toastify';

const ItemCard = ({ item, isWishlisted, onToggleWishlist }) => {
  const navigate = useNavigate(); 

  // Handle image source robustly
  const imageSrc = item.image || (item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/400');

  // Strict Click Handler to prevent opening the item page
  const handleHeartClick = (e) => {
      e.preventDefault();    // Stop Link default action
      e.stopPropagation();   // Stop event bubbling to parent
      onToggleWishlist(e);   // Execute your wishlist logic
  };

  // --- UPDATED: Handle Chat Click with Toasts ---
  const handleChatClick = async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const token = localStorage.getItem('token');
      if (!token) {
          toast.error("Please login to chat with the seller!", {
              position: "top-right",
              autoClose: 3000,
          });
          return;
      }

      const user = JSON.parse(localStorage.getItem('user'));
      
      // 1. Robust ID Extraction
      const sellerId = (item.seller && typeof item.seller === 'object') ? item.seller._id : item.seller;
      const currentUserId = user._id || user.id;

      // 2. Strict String Comparison (Prevents Self-Chat)
      if (String(currentUserId) === String(sellerId)) {
          toast.info("You cannot chat with yourself! This is your item.", {
              position: "top-right",
              autoClose: 3000,
          });
          return;
      }

      try {
          // 3. Create or fetch the chat via API
          const { data } = await API.post('/chat', { userId: sellerId });
          
          // 4. Navigate to /chats AND pass the chat data in 'state'
          navigate('/chats', { state: { chat: data } }); 
      } catch (error) {
          console.error("Error starting chat", error);
          toast.error("Failed to start chat. Please try again.", {
              position: "top-right"
          });
      }
  };
  
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 ease-in-out">
      
      {/* Image Container */}
      <div className="aspect-w-1 aspect-h-1 bg-gray-200 group-hover:opacity-90 h-56 relative">
        <img
          src={imageSrc}
          alt={item.title}
          className="w-full h-full object-center object-cover"
        />
        
        {/* --- WISHLIST BUTTON --- */}
        <button
          onClick={handleHeartClick}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-95 transition-all duration-200 z-30 group/heart cursor-pointer"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          {isWishlisted ? (
            <FaHeart className="text-pink-500 text-lg drop-shadow-sm" />
          ) : (
            <FaRegHeart className="text-gray-400 text-lg group-hover/heart:text-pink-500 transition-colors" />
          )}
        </button>

        {/* --- QUICK CHAT BUTTON --- */}
        <button
          onClick={handleChatClick}
          className="absolute bottom-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 active:scale-95 transition-all duration-200 z-30 text-indigo-600 hover:text-indigo-700 cursor-pointer group/chat"
          title="Chat with Seller"
        >
           <FaCommentDots className="text-lg group-hover/chat:scale-110 transition-transform" />
        </button>

        {/* Status Badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 uppercase tracking-wider shadow-sm z-20">
          {item.isSold ? <span className="text-red-600">Sold</span> : <span className="text-green-600">Available</span>}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 flex flex-col justify-between relative">
        <div>
          <p className="text-sm text-indigo-600 font-medium mb-1">{item.category}</p>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            <Link to={`/item/${item._id}`}>
              <span aria-hidden="true" className="absolute inset-0 z-10" />
              {item.title}
            </Link>
          </h3>
        </div>

        <div className="mt-4 flex items-end justify-between relative z-20">
            <p className="text-xl font-bold text-gray-900">
                ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
            </p>
            <span className="text-sm text-indigo-600 hover:text-indigo-800 font-medium pointer-events-none">
                View Details
            </span>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;