import React from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ItemCard = ({ item, isWishlisted, onToggleWishlist }) => {
  
  // Handle image source robustly
  const imageSrc = item.image || (item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/400');

  // Strict Click Handler to prevent opening the item page
  const handleHeartClick = (e) => {
      e.preventDefault();    // Stop Link default action
      e.stopPropagation();   // Stop event bubbling to parent
      onToggleWishlist(e);   // Execute your wishlist logic
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
        
        {/* --- WISHLIST BUTTON (Fixed) --- */}
        {/* Changed z-20 to z-30 to ensure it sits ABOVE the link overlay */}
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
            {/* The Link overlay makes the whole card clickable */}
            {/* z-10 ensures it is clickable but sits BELOW the z-30 button */}
            <Link to={`/item/${item._id}`}>
              <span aria-hidden="true" className="absolute inset-0 z-10" />
              {item.title}
            </Link>
          </h3>
        </div>
        <Link to={`/item/${item._id}`}>
        <div className="mt-4 flex items-end justify-between relative z-20">
            <p className="text-xl font-bold text-gray-900">
                ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
            </p>
            <span className="text-sm text-indigo-600 hover:text-indigo-800 font-medium pointer-events-none">
                View Details
            </span>
        </div>
        </Link>
      </div>
    </div>
  );
};

export default ItemCard;