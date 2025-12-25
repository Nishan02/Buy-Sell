// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import ItemCard from '../components/ItemCard';
import Footer from '../components/Footer';
import { categories, items } from '../data/MockData';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50">
      <Navbar />
      
      <main className="flex-grow">
        {/* 1. Hero Section (Big middle box) */}
        <HeroSection />

        {/* 2. Categories Section */}
        <section className="bg-white py-8 shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Shop by Category</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 transition-colors duration-200 whitespace-nowrap"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Items Grid Section */}
        <section className="py-12" id="items">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">Featured Items</h2>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">View all &rarr;</a>
            </div>
            <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;