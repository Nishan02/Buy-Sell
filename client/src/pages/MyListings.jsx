import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import { FaTrash, FaEdit, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

const MyListings = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const res = await API.get('/items/my-listings');
        // Handle both possible response formats
        setItems(res.data.items || res.data);
      } catch (err) {
        console.error("Error fetching listings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyItems();
  }, []);

  const handleToggleSold = async (id, currentStatus) => {
    try {
      await API.patch(`/items/${id}/status`, { isSold: !currentStatus });
      setItems(items.map(item => item._id === id ? { ...item, isSold: !currentStatus } : item));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this listing permanently?")) {
      try {
        await API.delete(`/items/${id}`);
        setItems(items.filter(item => item._id !== id));
      } catch (err) {
        alert("Failed to delete item");
      }
    }
  };

  if (loading) return <div className="text-center py-20 font-medium">Loading your items...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-500 text-sm mt-1">Manage and track your campus sales</p>
          </div>
          <Link to="/sell" className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md text-center">
            + List New Item
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-lg">You haven't listed any items yet.</p>
            <Link to="/sell" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">Start selling now</Link>
          </div>
        ) : (
          <>
            {/* 1. DESKTOP VIEW: Visible on Tablets and Desktops */}
            <div className="hidden md:block bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img className="h-14 w-14 rounded-lg object-cover border" src={item.images[0]} alt="" />
                          <div className="ml-4">
                            <Link to={`/item/${item._id}`} className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition">
                              {item.title}
                            </Link>
                            <div className="text-xs text-gray-500">{item.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        ₹{item.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleSold(item._id, item.isSold)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                            item.isSold ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          {item.isSold ? <FaCheckCircle className="mr-1.5"/> : <FaRegCircle className="mr-1.5"/>}
                          {item.isSold ? 'Sold' : 'Available'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link to={`/edit-item/${item._id}`} className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-2.5 rounded-lg transition" title="Edit Item">
                            <FaEdit size={16} />
                          </Link>
                          <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-900 bg-red-50 p-2.5 rounded-lg transition" title="Delete Item">
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. MOBILE VIEW: Visible on phones only */}
            <div className="md:hidden space-y-4">
              {items.map((item) => (
                <div key={item._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <img className="h-20 w-20 rounded-xl object-cover border" src={item.images[0]} alt="" />
                      <div className="ml-4">
                        <h3 className="text-base font-bold text-gray-900 leading-tight">{item.title}</h3>
                        <p className="text-indigo-600 font-black text-lg">₹{item.price.toLocaleString('en-IN')}</p>
                        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{item.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                    <button 
                      onClick={() => handleToggleSold(item._id, item.isSold)}
                      className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold border transition ${
                        item.isSold ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                      }`}
                    >
                      {item.isSold ? 'Mark Available' : 'Mark Sold'}
                    </button>
                    
                    <div className="flex space-x-2">
                      <Link to={`/edit-item/${item._id}`} className="p-3 text-indigo-600 bg-indigo-50 rounded-xl">
                        <FaEdit size={18} />
                      </Link>
                      <button onClick={() => handleDelete(item._id)} className="p-3 text-red-600 bg-red-50 rounded-xl">
                        <FaTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyListings;