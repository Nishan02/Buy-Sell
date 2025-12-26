import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa'; // Icons for contact buttons

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await API.get(`/items/${id}`);
        setItem(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  if (loading) return <div className="text-center py-20 font-medium">Loading item...</div>;
  if (!item) return <div className="text-center py-20">Item not found.</div>;

  // Helper to format WhatsApp link
  const getWhatsappLink = (number, title) => {
    // Cleans the number (removes spaces/dashes)
    const cleanNumber = number.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi, I'm interested in your listing: ${title} on CampusMart.`);
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
          
          {/* Left: Image Gallery */}
          <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-200 aspect-square">
            <img 
              src={item.images[0]} 
              alt={item.title} 
              className="w-full h-full object-center object-cover hover:scale-105 transition duration-500" 
            />
          </div>

          {/* Right: Item Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{item.title}</h1>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest ${item.isSold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {item.isSold ? 'SOLD' : 'AVAILABLE'}
              </span>
            </div>
            
            <div className="mt-4">
              <p className="text-4xl text-indigo-600 font-black">₹{item.price.toLocaleString('en-IN')}</p>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Description</h3>
              <div className="mt-3 text-base text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-100">
                {item.description}
              </div>
            </div>

            {/* Seller Information Card */}
            <div className="mt-10 border-t border-gray-200 pt-8">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Seller Information</h3>
              <div className="mt-4 flex items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-inner">
                  {item.seller.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-gray-900">{item.seller.name}</p>
                  <p className="text-xs text-gray-500">{item.seller.email}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {!item.isSold ? (
                <>
                  {/* WhatsApp Button */}
                  {item.contactNumber && (
                    <a 
                      href={getWhatsappLink(item.contactNumber, item.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition shadow-lg shadow-green-100"
                    >
                      <FaWhatsapp className="mr-2 text-xl" /> WhatsApp
                    </a>
                  )}
                  
                  {/* Email Button */}
                  <a 
                    href={`mailto:${item.seller.email}?subject=Interest in ${item.title}`}
                    className="flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-50 transition"
                  >
                    <FaEnvelope className="mr-2 text-lg" /> Email Seller
                  </a>
                </>
              ) : (
                <button disabled className="sm:col-span-2 w-full bg-gray-200 rounded-xl py-4 text-base font-bold text-gray-400 cursor-not-allowed uppercase tracking-widest">
                  This item has been sold
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;