// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import ItemDetails from "./pages/ItemDetails";
import MyListings from "./pages/MyListings";
import EditItem from "./pages/EditItem";

// --- PLACEHOLDERS (Temporary components until you create real files) ---
const SellItem = () => <div className="p-10 text-2xl font-bold">Sell Item Page (Coming Soon)</div>;
const UserProfile = () => <div className="p-10 text-2xl font-bold">User Profile Page (Coming Soon)</div>;

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        {/* === PUBLIC PAGES === */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/edit-item/:id" element={<EditItem />} />

        {/* === PROTECTED PAGES === */}
        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellItem />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
          <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />
        

        {/* 404 Page */}
        <Route path="*" element={<h1 className="text-center mt-20">404 Not Found</h1>} />
      </Routes>
    </div>
  );
}

export default App;