import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaEdit, FaSave, FaTimes, FaCamera } from 'react-icons/fa';

const UserProfile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    year: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch User Data on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');
        
        const data = await response.json();
        setUser({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          year: data.year || '',
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle Input Change
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Save Changes to Backend
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.name,
          phone: user.phone,
          year: user.year,
          // We are not sending password here to keep it simple, 
          // but you can add a "Change Password" modal later.
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedData = await response.json();
      
      // Update local storage so Navbar name updates immediately
      const savedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...savedUser, name: updatedData.name }));

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
          
          {/* Top Banner / Header Background */}
          <div className="h-32 bg-indigo-600"></div>

          {/* Profile Content */}
          <div className="px-8 pb-8">
            
            {/* 1. Profile Picture Area (Overlapping Banner) */}
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center shadow-md">
                   {/* Generate Initials if no image */}
                   <span className="text-4xl font-bold text-indigo-600">
                     {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                   </span>
                </div>
                {/* Fake Edit Photo Button (Visual Only for now) */}
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition">
                    <FaCamera size={14} />
                  </button>
                )}
              </div>

              {/* 2. Top Right Edit Actions */}
              <div className="mb-2">
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      <FaTimes className="mr-2" /> Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md"
                    >
                      <FaSave className="mr-2" /> Save Changes
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium"
                  >
                    <FaEdit className="mr-2 text-indigo-500" /> Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* 3. User Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
              
              {/* Name */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    disabled={!isEditing}
                    value={user.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 py-3 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-gray-50 text-gray-800 font-bold text-xl'} transition-all`}
                  />
                </div>
              </div>

              {/* Email (Read Only - usually shouldn't change email easily) */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="block w-full pl-10 py-3 rounded-lg border border-transparent bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <span className="text-xs text-gray-400 mt-1 ml-1">Email cannot be changed</span>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="phone"
                    disabled={!isEditing}
                    value={user.phone}
                    onChange={handleChange}
                    placeholder="Add phone number"
                    className={`block w-full pl-10 py-3 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-gray-50 text-gray-800'}`}
                  />
                </div>
              </div>

              {/* Year / Batch */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Year / Branch</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaGraduationCap className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="year"
                    disabled={!isEditing}
                    value={user.year}
                    onChange={handleChange}
                    placeholder="e.g. 2nd Year CSE"
                    className={`block w-full pl-10 py-3 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-gray-50 text-gray-800'}`}
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;