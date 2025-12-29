import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FaEnvelope, FaComments } from 'react-icons/fa';

const Contact = () => {

  // Smooth scroll to top when page opens
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Get in <span className="text-indigo-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have a question, need support, or want to connect?  
            Reach out to us via email or message us directly.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Email Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-indigo-100 rounded-full text-indigo-600 mb-6">
              <FaEnvelope size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Email Us
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              For general inquiries and support.
            </p>

            <a
              href="mailto:kampusCart@gmail.com"
              className="w-full block p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition"
            >
              <span className="font-medium text-gray-700 text-sm break-all">
                kampusCart@gmail.com
              </span>
            </a>
          </div>

          {/* Message Card */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
            <div className="p-4 bg-purple-100 rounded-full text-purple-600 mb-6">
              <FaComments size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Message Us
            </h3>
            {/* <p className="text-gray-500 mb-6 text-sm">
              Copy the numbers below and message us anytime.
            </p> */}

            <div className="w-full p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
              <span className="block font-medium text-gray-800 text-sm select-all">
                +91 91513 80456
              </span>
              <span className="block font-medium text-gray-800 text-sm select-all">
                +91 73079 12002
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
