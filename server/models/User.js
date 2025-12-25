import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true 
    },
    phone: { type: String },
    year: { type: String }, // e.g., 1st Year, 2nd Year
    profilePic: { type: String, default: "" },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,
}, { timestamps: true });

export default mongoose.model('User', userSchema);