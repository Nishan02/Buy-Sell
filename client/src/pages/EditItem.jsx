import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import ItemForm from '../components/ItemForm';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await API.get(`/items/${id}`);
        setInitialData(res.data);
      } catch (err) {
        alert("Error loading item");
        navigate('/my-listings');
      }
    };
    fetchItem();
  }, [id, navigate]);

 const handleUpdate = async (formDataWithFile) => {
  setLoading(true);
  try {
    await API.put(`/items/${id}`, formDataWithFile, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    navigate('/my-listings');
  } catch (err) {
    alert("Upload failed. Check file size.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Edit Listing</h1>
        {initialData ? (
          <ItemForm 
            initialData={initialData} 
            onSubmit={handleUpdate} 
            buttonText="Update Listing" 
            loading={loading}
          />
        ) : (
          <p>Loading data...</p>
        )}
      </div>
    </div>
  );
};

export default EditItem;