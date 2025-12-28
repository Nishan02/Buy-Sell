import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaTrash, FaCheckCircle, FaTimesCircle, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';

const MyListings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/items/my-listings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setItems(Array.isArray(data) ? data : data.items || []);
      } catch (err) {
        console.error("Error fetching listings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyItems();
  }, []);

  // FIX 1: Add e.preventDefault() to stop redirection
  const handleToggleSold = async (e, id, currentStatus) => {
    e.preventDefault(); // <--- STOPS THE CLICK FROM GOING TO THE LINK
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/items/${id}/status`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ isSold: !currentStatus })
      });

      if (res.ok) {
          setItems(items.map(item => item._id === id ? { ...item, isSold: !currentStatus } : item));
      }
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault(); // <--- STOPS THE CLICK FROM GOING TO THE LINK
    if (window.confirm("Are you sure you want to remove this item permanently?")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/items/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            setItems(items.filter(item => item._id !== id));
        }
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        toast.error("Failed to delete item");
      }
    }
  };

  if (loading) return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8 border-b border-gray-200 pb-5">
          <h1 className="text-3xl font-extrabold text-gray-900">My Listings</h1>
          <p className="text-gray-500 mt-2">Manage your active ads and sold items.</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-sm border-2 border-dashed border-gray-200">
            <div className="bg-indigo-50 p-4 rounded-full mb-4">
                <FaBoxOpen className="text-indigo-400 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No items listed yet</h3>
            <p className="text-gray-500 mt-2 text-center max-w-sm">
                Once you sell an item using the "Sell" page, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div 
                key={item._id} 
                className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col ${item.isSold ? 'opacity-75' : ''}`}
              >
                {/* View Details Link (Background Overlay) */}
                <Link to={`/edit-item/${item._id}`} className="absolute inset-0 z-0" title="Edit Item" />

                <div className="relative h-48 w-full bg-gray-200 overflow-hidden pointer-events-none">
                   <img 
                    src={item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/300'} 
                    alt={item.title} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                   />
                   <div className="absolute top-3 right-3">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide ${
                           item.isSold ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                       }`}>
                           {item.isSold ? 'Sold' : 'Active'}
                       </span>
                   </div>
                </div>

                <div className="p-5 flex-1 flex flex-col relative z-10 pointer-events-none">
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                                <p className="text-xs text-gray-500 uppercase font-semibold mt-1">{item.category}</p>
                            </div>
                            <p className="text-lg font-bold text-indigo-600">₹{item.price}</p>
                        </div>
                         <div className="mt-4 flex items-center text-xs text-gray-400">
                             <span>Posted on {new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* FIX 2: Added 'pointer-events-auto' so buttons work */}
                    <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 pointer-events-auto">
                        <button 
                            onClick={(e) => handleToggleSold(e, item._id, item.isSold)} // Pass 'e'
                            className={`flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors z-20 relative ${
                                item.isSold 
                                ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            }`}
                        >
                            {item.isSold ? (
                                <><FaCheckCircle className="mr-2"/> Repost</>
                            ) : (
                                <><FaTimesCircle className="mr-2"/> Mark Sold</>
                            )}
                        </button>

                        <button 
                            onClick={(e) => handleDelete(e, item._id)} // Pass 'e'
                            className="flex items-center justify-center px-3 py-2 rounded-lg text-sm font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors z-20 relative"
                        >
                            <FaTrash className="mr-2"/> Delete
                        </button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;