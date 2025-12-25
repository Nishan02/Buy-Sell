import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail.js';

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Domain Check
        const collegeDomain = "@mnnit.ac.in";
        if (!email.endsWith(collegeDomain)) {
            return res.status(403).json({ message: "Access restricted to college students only." });
        }

        // 2. Check User Status
        const userExists = await User.findOne({ email });

        if (userExists) {
            // If user is already verified, they truly "already exist"
            if (userExists.isVerified) {
                return res.status(400).json({ message: "User already exists. Please login." });
            }
            // If user exists but is NOT verified, we will "Update" them below instead of creating a new one
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Generate 6-digit code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 20 * 60 * 1000;

        let user;

        if (userExists) {
            // UPDATE existing unverified user with new details and new OTP
            userExists.name = name;
            userExists.password = hashedPassword;
            userExists.verificationCode = otp;
            userExists.verificationCodeExpires = otpExpires;
            user = await userExists.save();
        } else {
            // CREATE brand new user
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                verificationCode: otp,
                verificationCodeExpires: otpExpires,
                isVerified: false
            });
        }

        // 5. Send Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Your College Marketplace Verification Code',
                otp: otp,
                name: name,
            });
            res.status(201).json({ message: "Verification code sent to email!" });
        } catch (err) {
            console.log("NODEMAILER ERROR:", err);
            return res.status(500).json({ message: "Email could not be sent" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
    const { email, otp } = req.body;

    const user = await User.findOne({
        email,
        verificationCode: otp,
        verificationCodeExpires: { $gt: Date.now() }, // Check if code is not expired
    });

    if (!user) {
        // Debugging tip: Log what's happening to your terminal
        console.log(`Failed verify attempt for: ${email} with code: ${otp}`);
        return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully! You can now login." });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 2. Check if they verified their OTP
        if (!user.isVerified) {
            return res.status(401).json({ message: "Please verify your email first!" });
        }

        // 3. Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } // Stays logged in for 7 days
        );

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


