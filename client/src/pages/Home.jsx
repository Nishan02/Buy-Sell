import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ItemCard from '../components/ItemCard';
import Footer from '../components/Footer';
import API from '../api/axios.js';

const Home = () => {
  const [items, setItems] = useState([]);
  const [wishlist, setWishlist] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState(''); 

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await API.get('/items', {
        params: {
          search: searchQuery,
          category: selectedCategory,
          sortBy: sortBy
        }
      });
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');
    if (!token) return; 

    try {
      const response = await API.get('/users/wishlist');
      const ids = response.data.map(item => item._id);
      setWishlist(ids);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const handleToggleWishlist = async (e, itemId) => {
    e.preventDefault(); 
    e.stopPropagation();

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to save items to wishlist!");
        return;
    }

    try {
      if (wishlist.includes(itemId)) {
        setWishlist(prev => prev.filter(id => id !== itemId));
      } else {
        setWishlist(prev => [...prev, itemId]);
      }
      await API.post('/users/wishlist', { itemId });
    } catch (error) {
      console.error("Failed to update wishlist", error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory, searchQuery, sortBy]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />

        {/* --- FILTER & SORT SECTION (Now Scrollable / Non-Sticky) --- */}
        {/* Removed 'sticky top-20 z-10' to let it scroll up naturally */}
        <section className="bg-white py-8 shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-12 space-y-8 lg:space-y-0">
              
              {/* 1. LEFT SIDE: Sort Options */}
              <div className="flex-shrink-0">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Sort By</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSortBy(sortBy === 'priceLow' ? '' : 'priceLow')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      sortBy === 'priceLow'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => setSortBy(sortBy === 'priceHigh' ? '' : 'priceHigh')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      sortBy === 'priceHigh'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    Price: High to Low
                  </button>
                </div>
              </div>

              {/* 2. RIGHT SIDE: Categories */}
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Shop by Category</h3>
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                      onClick={() => setSelectedCategory('')}
                      className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        selectedCategory === '' 
                        ? 'bg-gray-900 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                   >
                     All
                   </button>
                  {['Cycles', 'Books & Notes', 'Electronics', 'Hostel Essentials', 'Stationery', 'Others'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                      className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                        selectedCategory === cat 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- ITEMS GRID SECTION --- */}
        <section className="py-12 min-h-[500px]" id="items">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {searchQuery ? `Results for "${searchQuery}"` : selectedCategory ? `${selectedCategory}` : 'Fresh Recommendations'}
              </h2>
              <span className="text-sm text-gray-500 font-medium">{items.length} items found</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {items.map((item) => (
                  <ItemCard 
                    key={item._id} 
                    item={item} 
                    isWishlisted={wishlist.includes(item._id)}
                    onToggleWishlist={(e) => handleToggleWishlist(e, item._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg font-medium">No items found matching your criteria.</p>
                <button onClick={() => {setSelectedCategory(''); setSortBy('');}} className="mt-4 text-indigo-600 font-bold hover:underline">Clear Filters</button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;