import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import { FaCloudUploadAlt, FaRupeeSign, FaMapMarkerAlt, FaTag, FaCamera, FaUser, FaPhone, FaEnvelope, FaTrash } from 'react-icons/fa';

const SellItem = () => {
  const navigate = useNavigate();
  
  // State for all text inputs
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Books & Notes', // Default
    customCategory: '',        // For "Others" input
    location: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
  });

  // State for SINGLE image
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill contact info if user is logged in (Optional)
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (savedUser.name) {
      setFormData(prev => ({
        ...prev,
        sellerName: savedUser.name,
        sellerEmail: savedUser.email
      }));
    }
  }, []);

  // Handle Text Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle SINGLE Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation: Ensure 1 image is selected
    if (!image) {
      setError('Please upload an image of the item.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      
      // Basic Fields
      data.append('title', formData.title);
      data.append('price', formData.price);
      
      // Handle Category Logic
      const finalCategory = formData.category === 'Others' ? formData.customCategory : formData.category;
      data.append('category', finalCategory);

      // Construct Rich Description with Contact Info
      const fullDescription = `
${formData.description}

📍 Location: ${formData.location}

📞 Contact Seller:
Name: ${formData.sellerName}
Phone: ${formData.sellerPhone}
Email: ${formData.sellerEmail}
      `;
      data.append('description', fullDescription);
      
      // Append SINGLE Image
      // IMPORTANT: Backend must use upload.single('image')
      data.append('image', image); 

      const token = localStorage.getItem('token'); 

      // NOTE: Make sure this URL matches your backend port
      const response = await fetch('http://localhost:5000/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: data 
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create item');
      }

      alert('Item posted successfully!');
      navigate('/'); 

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-indigo-600 pb-24 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold text-white tracking-tight">Sell Your Stuff</h1>
            <p className="mt-2 text-lg text-indigo-100">Reach thousands of students instantly.</p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Error Banner */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* --- LEFT COLUMN: VISUALS & CONTACT --- */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Image Upload Card (Single Image) */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FaCamera className="mr-2 text-indigo-500"/> Upload Photo
                        </h3>
                        
                        <div className="mt-2">
                            {preview ? (
                                // If image selected, show large preview with delete button
                                <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-indigo-100 shadow-sm group">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => { setImage(null); setPreview(null); }}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-colors"
                                    >
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            ) : (
                                // If no image, show upload UI
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-indigo-300 border-dashed rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-colors group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <FaCloudUploadAlt className="w-16 h-16 text-indigo-400 group-hover:text-indigo-600 mb-3 transition-colors" />
                                        <p className="text-sm text-gray-600 font-semibold">Click to upload photo</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                    {/* Note: 'multiple' attribute removed */}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                    </div>
                    
                    {/* Contact Info Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FaPhone className="mr-2 text-indigo-500"/> Contact Info
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">Buyers will use this to contact you.</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Your Name</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input type="text" name="sellerName" required value={formData.sellerName} onChange={handleChange} className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="John Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaPhone className="text-gray-400" />
                                    </div>
                                    <input type="tel" name="sellerPhone" required value={formData.sellerPhone} onChange={handleChange} className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400" />
                                    </div>
                                    <input type="email" name="sellerEmail" required value={formData.sellerEmail} onChange={handleChange} className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" placeholder="student@mnnit.ac.in" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: ITEM DETAILS --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-6">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Item Details</h3>
                        
                        <div className="grid grid-cols-1 gap-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">What are you selling?</label>
                                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-2 block w-full border-gray-300 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4 text-lg" placeholder="e.g. 1st Year Engineering Books Set" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Price</label>
                                    <div className="mt-2 relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaRupeeSign className="text-gray-500" />
                                        </div>
                                        <input type="number" name="price" required value={formData.price} onChange={handleChange} className="block w-full pl-10 border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="0.00" />
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Hostel / Location</label>
                                    <div className="mt-2 relative rounded-xl shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaMapMarkerAlt className="text-gray-500" />
                                        </div>
                                        <input type="text" name="location" required value={formData.location} onChange={handleChange} className="block w-full pl-10 border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="e.g. Patel Hostel, Room 102" />
                                    </div>
                                </div>
                            </div>

                            {/* Category + Dynamic 'Others' Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <div className="mt-2 relative rounded-xl shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaTag className="text-gray-500" />
                                    </div>
                                    <select name="category" value={formData.category} onChange={handleChange} className="block w-full pl-10 border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-3 bg-white">
                                        <option value="Books & Notes">Books & Notes</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Hostel Essentials">Hostel Essentials</option>
                                        <option value="Cycles">Cycles</option>
                                        <option value="Stationery">Stationery</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            </div>

                            {/* CONDITIONAL RENDER: If 'Others' is selected */}
                            {formData.category === 'Others' && (
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-fade-in">
                                    <label className="block text-sm font-medium text-indigo-700">Specify Category</label>
                                    <input 
                                        type="text" 
                                        name="customCategory" 
                                        required 
                                        value={formData.customCategory} 
                                        onChange={handleChange} 
                                        className="mt-2 block w-full border-indigo-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3" 
                                        placeholder="e.g. Musical Instruments, Gym Gear..." 
                                    />
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea name="description" rows={5} required value={formData.description} onChange={handleChange} className="mt-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full border border-gray-300 rounded-xl p-4" placeholder="Describe the item condition, why you are selling it, and any other details..." />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6">
                            <button type="submit" disabled={loading} className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-1'} transition-all duration-200`}>
                                {loading ? 'Publishing Item...' : 'Post Ad Now'}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </form>
      </div>
    </div>
  );
};

export default SellItem;