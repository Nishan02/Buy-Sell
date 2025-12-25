import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // 1. Import useLocation
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ItemCard from '../components/ItemCard';
import Footer from '../components/Footer';
import API from '../api/axios.js';

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // 2. Get the current URL location
  const location = useLocation();

  // 3. Helper to extract search query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search') || '';

  // 4. Fetch items logic (Updated to include search)
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Construct URL based on both Search and Category
      let url = '/items?';
      if (searchQuery) url += `search=${searchQuery}&`;
      if (selectedCategory) url += `category=${selectedCategory}`;

      const response = await API.get(url);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      setLoading(false);
    }
  };

  // 5. Trigger fetch whenever category OR search query changes
  useEffect(() => {
    fetchItems();
  }, [selectedCategory, searchQuery]); 

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        <HeroSection />

        {/* Categories Section */}
        <section className="bg-white py-8 shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {['Cycle', 'Cooler', 'Books', 'Electronics', 'Other'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                  className={`inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                    selectedCategory === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Items Grid Section */}
        <section className="py-12" id="items">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {searchQuery ? `Results for "${searchQuery}"` : selectedCategory ? `${selectedCategory} listings` : 'Featured Items'}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
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