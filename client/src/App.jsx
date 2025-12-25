// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth'; 

function App() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <Routes>
        {/* Default path redirects to Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* The only pages we care about right now */}
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
      </Routes>
    </div>
  );
}

export default App;