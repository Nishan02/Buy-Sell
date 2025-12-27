import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import { FaCloudUploadAlt, FaRupeeSign, FaMapMarkerAlt, FaTag, FaCamera, FaUser, FaPhone, FaEnvelope, FaTrash, FaTimesCircle } from 'react-icons/fa';

const SellItem = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Books & Notes', 
    customCategory: '',        
    location: '',
    sellerName: '',
    sellerPhone: '',
    sellerEmail: '',
  });

  // Updated for multiple images
  const [imageFiles, setImageFiles] = useState([]); 
  const [previews, setPreviews] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle multiple Image Selection (Max 3)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 3) {
      alert("Maximum 3 images allowed");
      return;
    }
    setImageFiles([...imageFiles, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (imageFiles.length === 0) {
      setError('Please upload at least one image.');
      setLoading(false);
      return;
    }

    // Phone Validation: 10 digits
    const rawPhone = formData.sellerPhone.replace(/\D/g, '');
    if (rawPhone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('price', formData.price);
      data.append('category', formData.category === 'Others' ? formData.customCategory : formData.category);
      data.append('location', formData.location);
      data.append('contactNumber', `91${rawPhone}`); // Auto-prepend 91
      data.append('description', formData.description);

      // FIX: Use 'images' (plural) to match backend upload.array('images', 3)
      imageFiles.forEach((file) => {
        data.append('images', file); 
      });

      const token = localStorage.getItem('token'); 
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

      <div className="bg-indigo-600 pb-24 pt-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-extrabold text-white">Sell Your Stuff</h1>
            <p className="mt-2 text-indigo-100 text-lg">Quick, easy, and trusted by MNNITians.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16">
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm">
                <p className="text-red-700 font-medium italic">⚠️ {error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
                {/* --- LEFT COLUMN --- */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Multi-Image Upload Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FaCamera className="mr-2 text-indigo-500"/> Product Photos
                        </h3>
                        
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {previews.map((src, index) => (
                                <div key={index} className="relative h-24 rounded-xl overflow-hidden border-2 border-indigo-50 shadow-inner group">
                                    <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                    <button 
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                    >
                                        <FaTimesCircle size={14} />
                                    </button>
                                </div>
                            ))}
                            
                            {previews.length < 3 && (
                                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all group">
                                    <FaCloudUploadAlt className="text-indigo-400 group-hover:text-indigo-600 text-2xl" />
                                    <span className="text-[10px] font-bold text-indigo-500 mt-1 uppercase">Add Image</span>
                                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 text-center italic">Upload up to 3 clear photos.</p>
                    </div>
                    
                    {/* Contact Info Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <FaPhone className="mr-2 text-indigo-500"/> Seller Identity
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase">Your Name</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-300" />
                                    </div>
                                    <input type="text" name="sellerName" required value={formData.sellerName} onChange={handleChange} className="block w-full pl-10 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase">WhatsApp Number</label>
                                <div className="mt-1 relative flex">
                                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 font-bold text-sm">+91</span>
                                    <input type="tel" name="sellerPhone" required maxLength="10" value={formData.sellerPhone} onChange={handleChange} className="block w-full border-gray-200 rounded-r-xl focus:ring-indigo-500 focus:border-indigo-500" placeholder="9876543210" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase">Email Address</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-300" />
                                    </div>
                                    <input type="email" name="sellerEmail" required value={formData.sellerEmail} onChange={handleChange} className="block w-full pl-10 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                        <h3 className="text-2xl font-black text-gray-900">Ad Particulars</h3>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700">Item Title</label>
                                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-2 block w-full border-gray-200 rounded-xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-3 px-4" placeholder="e.g. Milton 1L Steel Bottle" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Asking Price</label>
                                    <div className="mt-2 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaRupeeSign className="text-gray-400" />
                                        </div>
                                        <input type="number" name="price" required value={formData.price} onChange={handleChange} className="block w-full pl-10 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="Amount" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700">Hostel/Building</label>
                                    <div className="mt-2 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaMapMarkerAlt className="text-gray-400" />
                                        </div>
                                        <input type="text" name="location" required value={formData.location} onChange={handleChange} className="block w-full pl-10 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-3" placeholder="e.g. Tandon Hostel" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700">Category</label>
                                <div className="mt-2 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaTag className="text-gray-400" />
                                    </div>
                                    <select name="category" value={formData.category} onChange={handleChange} className="block w-full pl-10 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 py-3 bg-white">
                                        <option value="Books & Notes">Books & Notes</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Hostel Essentials">Hostel Essentials</option>
                                        <option value="Cycles">Cycles</option>
                                        <option value="Stationery">Stationery</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>
                            </div>

                            {formData.category === 'Others' && (
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <label className="block text-sm font-bold text-indigo-700 text-xs">Custom Category</label>
                                    <input type="text" name="customCategory" required value={formData.customCategory} onChange={handleChange} className="mt-2 block w-full border-indigo-200 rounded-lg py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Musical Instruments" />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700">Item Description</label>
                                <textarea name="description" rows={5} required value={formData.description} onChange={handleChange} className="mt-2 block w-full border-gray-200 rounded-xl p-4 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Condition, time used, accessories included..." />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl shadow-lg text-lg font-black text-white ${loading ? 'bg-gray-400 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-2xl hover:-translate-y-1 transition-all'}`}>
                                {loading ? 'PUBLISHING...' : 'POST AD NOW'}
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