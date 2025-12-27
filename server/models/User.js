import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { type: String, required: true },
    
    // Profile Fields
    phone: { type: String },
    year: { type: String }, 
    profilePic: { type: String, default: "" },

    // --- VERIFICATION FIELDS (Standardized) ---
    isVerified: { type: Boolean, default: false },
    otp: { type: String },          // Use this for the 6-digit code
    otpExpires: { type: Date },     // Use this to check expiry (optional but recommended)
    // ------------------------------------------

    // Password Reset Fields
    resetPasswordToken: String,
    resetPasswordExpire: Date,

}, { timestamps: true });

export default mongoose.model('User', userSchema);