// src/components/ItemCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  return (
    <div className="group relative bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <div className="aspect-w-1 aspect-h-1 bg-gray-200 group-hover:opacity-90 h-56 relative">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-center object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-gray-700 uppercase tracking-wider shadow-sm">
          {item.condition}
        </div>
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <p className="text-sm text-indigo-600 font-medium mb-1">{item.category}</p>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            <Link to={`/item/${item.id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {item.name}
            </Link>
          </h3>
        </div>
        <div className="mt-4 flex items-end justify-between">
            <p className="text-xl font-bold text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View Details</button>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;