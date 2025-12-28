// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import ItemDetails from "./pages/ItemDetails";
import MyListings from "./pages/MyListings";
import EditItem from "./pages/EditItem";
import SellItem from "./pages/SellItem";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from "./pages/Wishlist";
import Chat from "./pages/Chat";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/passwordreset/:resetToken" element={<ResetPassword />} />

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

         <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sell"
          element={
            <ProtectedRoute>
              <SellItem />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-item/:id"
          element={
            <ProtectedRoute>
              <EditItem />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/wishlist" 
          element={ 
            <ProtectedRoute>
               <Wishlist /> 
            </ProtectedRoute> } 
        />

        <Route 
          path="/chats" 
          element={
            <ProtectedRoute>
              <Chat />
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