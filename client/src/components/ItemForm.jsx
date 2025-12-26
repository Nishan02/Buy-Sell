import React, { useState, useEffect } from 'react';

const ItemForm = ({ initialData, onSubmit, buttonText, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Other',
    contactNumber: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (initialData) {
      // If editing, we strip the '91' prefix so the user sees their 10-digit number
      const displayData = { ...initialData };
      if (displayData.contactNumber && displayData.contactNumber.startsWith('91')) {
        displayData.contactNumber = displayData.contactNumber.slice(2);
      }
      setFormData(displayData);
      
      if (initialData.images && initialData.images[0]) {
        setPreview(initialData.images[0]);
      }
    }
  }, [initialData]);

  const validatePhone = (number) => {
    const cleanNumber = number.replace(/\D/g, ''); 
    if (cleanNumber.length > 0 && cleanNumber.length !== 10) {
      setPhoneError("Please enter a valid 10-digit mobile number.");
    } else {
      setPhoneError('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Call validation here
    if (name === 'contactNumber') {
      validatePhone(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawNumber = formData.contactNumber.replace(/\D/g, '');
    
    if (rawNumber.length !== 10) {
        alert("Please enter a valid 10-digit number.");
        return;
    }

    const finalPhoneNumber = `91${rawNumber}`;
    const data = new FormData();
    data.append('title', formData.title);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('contactNumber', finalPhoneNumber);
    if (imageFile) data.append('image', imageFile);

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Product Title</label>
        <input
          name="title"
          type="text"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="e.g. Hero Ranger Cycle"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Price (₹)</label>
          <input
            name="price"
            type="number"
            required
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {['Cycle', 'Cooler', 'Books', 'Electronics', 'Other'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Description</label>
        <textarea
          name="description"
          rows="4"
          required
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Tell buyers about the condition, age, etc."
        />
      </div>

      {/* WhatsApp Number with +91 prefix */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">WhatsApp Contact Number</label>
        <div className="mt-1 relative rounded-lg shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm font-bold">+91</span>
          </div>
          <input
            name="contactNumber"
            type="tel"
            required
            maxLength="10"
            value={formData.contactNumber}
            onChange={handleChange}
            className={`block w-full pl-12 pr-3 py-3 border rounded-lg outline-none transition focus:ring-2 ${
              phoneError ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-indigo-500'
            }`}
            placeholder="9876543210"
          />
        </div>
        {phoneError && <p className="mt-1 text-xs text-red-600 font-medium italic">{phoneError}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700">Product Image</label>
        <div className="mt-2 flex items-center space-x-4">
          {preview && (
            <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border shadow-sm" />
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg disabled:bg-gray-400"
      >
        {loading ? "Processing..." : buttonText}
      </button>
    </form>
  );
};

export default ItemForm;