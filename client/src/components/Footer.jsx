import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaStore } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Updated grid to 3 columns since we removed the rightmost contact section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          
          {/* 1. Brand Column */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center text-2xl font-black text-white tracking-tight mb-6">
              <FaStore className="h-8 w-8 mr-2.5 text-indigo-500" />
              <span>kampus<span className="text-indigo-400">Cart</span></span>
            </Link>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              The trusted marketplace for students to buy, sell, and connect. Sustainable, safe, and built for your campus.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaFacebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaTwitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaInstagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><FaLinkedin size={20} /></a>
            </div>
          </div>

          {/* 2. Platform Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Platform</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/sell" className="hover:text-indigo-400 transition-colors">Sell an Item</Link></li>
              <li><Link to="/lost-and-found" className="hover:text-indigo-400 transition-colors">Lost & Found</Link></li>
              <li><Link to="/chats" className="hover:text-indigo-400 transition-colors">Messages</Link></li>
            </ul>
          </div>

          {/* 3. Support Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about" className="hover:text-indigo-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400 transition-colors">Contact Support</Link></li>
              <li><Link to="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              {/* <li><Link to="/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</Link></li> */}
            </ul>
          </div>

        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} kampusCart. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
            <Link to="/sitemap" className="hover:text-white">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;