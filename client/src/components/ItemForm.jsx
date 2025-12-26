import React, { useState, useEffect } from 'react';

const ItemForm = ({ initialData, onSubmit, buttonText, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'Other',
  });

const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.images && initialData.images[0]) {
        setPreview(initialData.images[0]); // Show existing image initially
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setPreview(URL.createObjectURL(file)); // Show new image preview
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    
    data.append('price', formData.price);
    
    data.append('description', formData.description);
    data.append('category', formData.category);
    if (imageFile) data.append('image', imageFile);

    onSubmit(data);
};

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
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
      <div>
        <label className="block text-sm font-semibold text-gray-700">Product Image</label>
        <div className="mt-2 flex items-center space-x-4">
          {preview && (
            <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border" />
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