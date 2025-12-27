import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { FaUser, FaEnvelope, FaPhone, FaGraduationCap, FaEdit, FaSave, FaTimes, FaCamera, FaSpinner, FaCheck } from 'react-icons/fa';
// 1. Import react-easy-crop
import Cropper from 'react-easy-crop';

// --- UTILITY FUNCTION FOR CROPPING (Put this outside the component or in a separate utils file) ---
// This function creates a new HTMLImageElement, draws it onto a canvas based on the 
// crop coordinates, and returns the resulting cropped image as a Blob file.
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size to match the desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped portion of the image onto the canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // As a Blob (file) to send to backend
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      // Set a name for the file
      blob.name = 'croppedImage.jpeg';
      resolve(blob);
    }, 'image/jpeg', 1); // quality 0 to 1
  });
}
// -----------------------------------------------------------------------------------------------


const UserProfile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    phone: '',
    year: '',
    profilePic: ''
  });

  // --- State for Image Handling & Cropping ---
  const [imageFile, setImageFile] = useState(null); // The final file to send to DB
  const [imagePreview, setImagePreview] = useState(null); // The main circular profile view
  
  // Cropper states
  const [tempImageSrc, setTempImageSrc] = useState(null); // The raw image selected from input
  const [showCropModal, setShowCropModal] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false); // Loading state while generating crop
  // -------------------------------------------
  
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setUser({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          year: data.year || '',
          profilePic: data.profilePic || ''
        });
        if (data.profilePic) setImagePreview(data.profilePic);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setUser({ ...user, [e.target.name]: e.target.value });

  // 1. Handle File Selection -> Open Modal with Raw Image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Reset cropper settings for new image
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      // Create URL for the raw image to feed into the cropper
      setTempImageSrc(URL.createObjectURL(file));
      setShowCropModal(true);
      e.target.value = null; 
    }
  };

  // Callback from Cropper when user stops dragging/zooming
  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);


  // 2. Generate the Cropped Image and Confirm
  const showCroppedImage = useCallback(async () => {
    setIsCropping(true);
    try {
      // Use the utility function to generate the blob based on coordinates
      const croppedImageBlob = await getCroppedImg(
        tempImageSrc,
        croppedAreaPixels
      );

      // Create a preview URL for the main profile circle
      setImagePreview(URL.createObjectURL(croppedImageBlob));
      // Set the actual blob file to be sent to backend later
      setImageFile(croppedImageBlob);
      
      setShowCropModal(false);
    } catch (e) {
      console.error(e);
      alert("Could not crop image");
    } finally {
      setIsCropping(false);
    }
  }, [tempImageSrc, croppedAreaPixels]);


  // 3. Cancel Image Selection
  const cancelImage = () => {
    setImageFile(null);
    setTempImageSrc(null);
    setZoom(1);
    setShowCropModal(false);
  };

  const triggerFileInput = () => fileInputRef.current.click();

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('phone', user.phone);
      formData.append('year', user.year);
      
      // Append the CROPPED file Blob
      if (imageFile) formData.append('profilePic', imageFile);

      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData 
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      const updatedData = await response.json();
      
      const savedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ 
          ...savedUser, 
          name: updatedData.name,
          profilePic: updatedData.profilePic 
      }));

      if (updatedData.profilePic) setImagePreview(updatedData.profilePic);
      
      setIsEditing(false);
      setImageFile(null);
      alert("Profile updated successfully!");

    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 font-bold">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
          
          <div className="h-32 bg-indigo-600"></div>

          <div className="px-8 pb-8">
            
            {/* Profile Picture Section */}
            <div className="relative -mt-16 mb-6 flex justify-between items-end">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center shadow-md overflow-hidden">
                    {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-4xl font-bold text-indigo-600">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                    )}
                </div>

                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>

                {isEditing && (
                  <button onClick={triggerFileInput} className="absolute bottom-0 right-0 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition shadow-lg z-10" title="Upload Photo">
                    <FaCamera size={16} />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mb-2">
                {isEditing ? (
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                          setIsEditing(false);
                          setImagePreview(user.profilePic || null);
                          setImageFile(null);
                      }}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                    >
                      <FaTimes className="mr-2" /> Cancel
                    </button>
                    
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] justify-center"
                    >
                      {saving ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" /> Saving...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" /> Save Changes
                        </>
                      )}
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

            {/* User Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
               {/* ... (This section remains exactly the same as before) ... */}
               <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaUser className="text-gray-400" /></div>
                  <input type="text" name="name" disabled={!isEditing} value={user.name} onChange={handleChange} className={`block w-full pl-10 py-3 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-gray-50 text-gray-800 font-bold text-xl'} transition-all`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaEnvelope className="text-gray-400 mb-1" /></div>
                  <input type="email" value={user.email} disabled className="block w-full pl-10 py-3 rounded-lg border border-transparent bg-gray-50 text-gray-500 cursor-not-allowed" />
                  <span className="text-xs text-gray-500 -mt-2 ml-2 flex items-center gap-1">
                  <span role="img" aria-label="lock">🔒</span> Email cannot be changed </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaPhone className="text-gray-400" /></div>
                  <input type="text" name="phone" disabled={!isEditing} value={user.phone} onChange={handleChange} placeholder="Add phone number" className={`block w-full pl-10 py-3 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-gray-50 text-gray-800'}`} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Current Year / Branch</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaGraduationCap className="text-gray-400" /></div>
                  <input type="text" name="year" disabled={!isEditing} value={user.year} onChange={handleChange} placeholder="e.g. 2nd Year CSE" className={`block w-full pl-10 py-3 rounded-lg border ${isEditing ? 'border-indigo-300 bg-white focus:ring-2 focus:ring-indigo-500' : 'border-transparent bg-gray-50 text-gray-800'}`} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- NEW UPDATED PREVIEW / CROP MODAL --- */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Adjust Profile Picture</h3>
            </div>
            
            <div className="p-4 flex flex-col items-center">
              <p className="text-sm text-gray-500 mb-4">Drag to reposition. Use slider to zoom.</p>
              
              {/* Cropper Container - Needs relative position and explicit height */}
              <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                 <Cropper
                    image={tempImageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // 1:1 Aspect Ratio for perfect square/circle
                    cropShape="round" // Makes the cropping area circular
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
              </div>

              {/* Zoom Slider */}
               <div className="mt-6 w-full flex items-center space-x-2 px-4">
                  <span role="img" aria-label="zoom out" className="text-gray-500">➖</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span role="img" aria-label="zoom in" className="text-gray-500">➕</span>
               </div>
            </div>

            <div className="p-4 bg-gray-50 flex justify-end space-x-3 border-t">
              <button 
                onClick={cancelImage}
                disabled={isCropping}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={showCroppedImage}
                disabled={isCropping}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center disabled:opacity-50"
              >
                {isCropping ? (
                     <>Processing...</>
                ) : (
                     <>
                       <FaCheck className="mr-2" /> Confirm Crop
                     </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;