// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:flex md:items-center md:justify-between">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-gray-400 hover:text-gray-300">About Us</a>
          <a href="#" className="text-gray-400 hover:text-gray-300">Contact</a>
          <a href="#" className="text-gray-400 hover:text-gray-300">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-gray-300">Terms of Service</a>
        </div>
        <div className="mt-8 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} CampusMart. Built for MNNIT. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;