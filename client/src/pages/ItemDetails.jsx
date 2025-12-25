import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';

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

  if (loading) return <div className="text-center py-20">Loading item...</div>;
  if (!item) return <div className="text-center py-20">Item not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
          
          {/* Left: Image Gallery */}
          <div className="rounded-lg overflow-hidden bg-gray-200 aspect-square">
            <img 
              src={item.images[0]} 
              alt={item.title} 
              className="w-full h-full object-center object-cover" 
            />
          </div>

          {/* Right: Item Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex justify-between items-center">
               <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{item.title}</h1>
               <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.isSold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                 {item.isSold ? 'SOLD' : 'AVAILABLE'}
               </span>
            </div>
            
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl text-gray-900 font-bold">₹{item.price.toLocaleString('en-IN')}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900">Description</h3>
              <div className="mt-2 text-base text-gray-700 space-y-4">
                {item.description}
              </div>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900">Seller Information</h3>
              <div className="mt-4 flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {item.seller.name.charAt(0)}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{item.seller.name}</p>
                  <p className="text-sm text-gray-500">{item.seller.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              {!item.isSold ? (
                <a 
                  href={`mailto:${item.seller.email}?subject=Interest in ${item.title}`}
                  className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Contact Seller
                </a>
              ) : (
                <button disabled className="w-full bg-gray-300 rounded-md py-3 px-8 text-base font-medium text-gray-500 cursor-not-allowed">
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