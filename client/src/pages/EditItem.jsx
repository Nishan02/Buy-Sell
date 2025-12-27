import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaCloudUploadAlt, FaRupeeSign, FaMapMarkerAlt, FaTag, FaCamera, FaUser, FaPhone, FaEnvelope, FaTrash, FaSave, FaArrowLeft, FaEye } from 'react-icons/fa';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for form fields
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

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch Existing Item Data
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/items/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Failed to fetch item');

        // Parse Description for Contact Info
        let description = data.description || '';
        let location = '';
        let sellerName = '';
        let sellerPhone = '';
        let sellerEmail = '';

        const locSplit = description.split('📍 Location: ');
        if (locSplit.length > 1) {
          description = locSplit[0].trim();
          const rest = locSplit[1];
          const contactSplit = rest.split('📞 Contact Seller:');
          location = contactSplit[0].trim();

          if (contactSplit.length > 1) {
            const contactInfo = contactSplit[1];
            const nameMatch = contactInfo.match(/Name: (.*)/);
            const phoneMatch = contactInfo.match(/Phone: (.*)/);
            const emailMatch = contactInfo.match(/Email: (.*)/);

            if (nameMatch) sellerName = nameMatch[1].trim();
            if (phoneMatch) sellerPhone = phoneMatch[1].trim();
            if (emailMatch) sellerEmail = emailMatch[1].trim();
          }
        }

        const standardCategories = ['Books & Notes', 'Electronics', 'Hostel Essentials', 'Cycles', 'Stationery'];
        const isOther = !standardCategories.includes(data.category);

        setFormData({
          title: data.title,
          price: data.price,
          description: description,
          category: isOther ? 'Others' : data.category,
          customCategory: isOther ? data.category : '',
          location: location,
          sellerName: sellerName,
          sellerPhone: sellerPhone,
          sellerEmail: sellerEmail,
        });

        const existingImage = data.image || (data.images && data.images[0]);
        if (existingImage) {
            setPreview(existingImage);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('price', formData.price);
      
      const finalCategory = formData.category === 'Others' ? formData.customCategory : formData.category;
      data.append('category', finalCategory);

      const fullDescription = `
${formData.description}

📍 Location: ${formData.location}

📞 Contact Seller:
Name: ${formData.sellerName}
Phone: ${formData.sellerPhone}
Email: ${formData.sellerEmail}
      `;
      data.append('description', fullDescription);
      
      if (image) {
        data.append('image', image); 
      }

      const token = localStorage.getItem('token'); 
      const response = await fetch(`http://localhost:5000/api/items/${id}`, {
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${token}` },
        body: data 
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update item');

      alert('Item updated successfully!');
      navigate('/mylistings');

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      <Navbar />

      {/* Modern Header - Simple & Clean */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-indigo-600 transition">
                <FaArrowLeft />
             </button>
             <h1 className="text-xl font-bold text-gray-900">Edit Listing</h1>
          </div>
          <div className="flex items-center space-x-2">
             <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mr-2 hidden sm:block">Changes save to "My Listings"</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: EDIT FORM (Span 7) */}
            <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Section 1: Visuals */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Media</h3>
                        <div className="flex items-start space-x-6">
                            <div className="flex-shrink-0">
                                {preview ? (
                                    <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-gray-200 group">
                                        <img src={preview} alt="Item" className="h-full w-full object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <FaCamera className="text-white text-xl" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-32 w-32 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                                        <FaCamera className="text-2xl" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-900 mb-1">Update Photo</label>
                                <p className="text-xs text-gray-500 mb-3">Upload a new photo to replace the current one. High quality images sell faster.</p>
                                <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                                    <FaCloudUploadAlt className="mr-2 text-gray-500" />
                                    Choose File
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Core Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Core Info</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Item Title</label>
                                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg px-4 py-3 transition-colors" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                                <div className="mt-1 relative rounded-lg shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaRupeeSign className="text-gray-400" />
                                    </div>
                                    <input type="number" name="price" required value={formData.price} onChange={handleChange} className="block w-full pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg py-3 transition-colors" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg px-4 py-3 transition-colors">
                                    <option value="Books & Notes">Books & Notes</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Hostel Essentials">Hostel Essentials</option>
                                    <option value="Cycles">Cycles</option>
                                    <option value="Stationery">Stationery</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>

                            {formData.category === 'Others' && (
                                <div className="md:col-span-2">
                                     <label className="block text-sm font-medium text-gray-700">Specify Category</label>
                                     <input type="text" name="customCategory" required value={formData.customCategory} onChange={handleChange} className="mt-1 block w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg px-4 py-3 transition-colors" placeholder="e.g. Sports Gear" />
                                </div>
                            )}

                             <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea name="description" rows={4} required value={formData.description} onChange={handleChange} className="mt-1 block w-full bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg px-4 py-3 transition-colors" />
                            </div>
                         </div>
                    </div>

                    {/* Section 3: Contact & Location */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Contact & Location</h3>
                         <div className="grid grid-cols-1 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Hostel / Location</label>
                                <div className="mt-1 relative rounded-lg">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaMapMarkerAlt className="text-gray-400" />
                                    </div>
                                    <input type="text" name="location" required value={formData.location} onChange={handleChange} className="block w-full pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg py-3 transition-colors" />
                                </div>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="relative">
                                     <FaUser className="absolute top-4 left-3 text-gray-400" />
                                     <input type="text" name="sellerName" required value={formData.sellerName} onChange={handleChange} className="block w-full pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg py-3 transition-colors" placeholder="Seller Name" />
                                 </div>
                                 <div className="relative">
                                     <FaPhone className="absolute top-4 left-3 text-gray-400" />
                                     <input type="tel" name="sellerPhone" required value={formData.sellerPhone} onChange={handleChange} className="block w-full pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg py-3 transition-colors" placeholder="Phone" />
                                 </div>
                             </div>
                             <div className="relative">
                                 <FaEnvelope className="absolute top-4 left-3 text-gray-400" />
                                 <input type="email" name="sellerEmail" required value={formData.sellerEmail} onChange={handleChange} className="block w-full pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 rounded-lg py-3 transition-colors" placeholder="Email" />
                             </div>
                         </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={() => navigate('/mylistings')} className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition">Cancel</button>
                        <button type="submit" disabled={submitting} className={`px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}>
                             <FaSave className="mr-2" />
                             {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>

                </form>
            </div>

            {/* RIGHT COLUMN: LIVE PREVIEW (Span 5 - Sticky) */}
            <div className="lg:col-span-5 hidden lg:block">
                <div className="sticky top-40 space-y-4">
                    <div className="flex items-center justify-between">
                         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
                            <FaEye className="mr-2" /> Live Preview
                         </h3>
                         <span className="text-xs text-indigo-500 font-medium bg-indigo-50 px-2 py-1 rounded">What buyers see</span>
                    </div>

                    {/* THE CARD PREVIEW */}
                    <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col transform scale-100">
                        {/* Image */}
                        <div className="relative h-64 w-full bg-gray-200">
                           <img 
                            src={preview || 'https://via.placeholder.com/400x300?text=No+Image'} 
                            alt={formData.title} 
                            className="h-full w-full object-cover"
                           />
                           <div className="absolute top-3 right-3">
                               <span className="px-3 py-1 rounded-full text-xs font-bold shadow-sm uppercase tracking-wide bg-green-500 text-white">
                                   Active
                               </span>
                           </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{formData.title || 'Item Title'}</h3>
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide mt-1">
                                        {formData.category === 'Others' ? (formData.customCategory || 'Category') : formData.category}
                                    </p>
                                </div>
                                <p className="text-2xl font-black text-indigo-600">₹{formData.price || '000'}</p>
                            </div>
                            
                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
                                {formData.description || 'Description will appear here...'}
                            </p>

                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
                                 <span className="flex items-center"><FaMapMarkerAlt className="mr-1" /> {formData.location || 'Location'}</span>
                                 <span>Just now</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-4">This is a preview. Interactions are disabled.</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default EditItem;