import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/sendEmail.js';

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if email ends with your college domain
        const collegeDomain = "@mnnit.ac.in";
        
        if (!email.endsWith(collegeDomain)) {
            return res.status(403).json({ message: "Access restricted to college students only." });
        }

        // 2. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();


        // 4. Create User
        const user = await User.create({
            name,
            email,
            password: hashedPassword, // (Already hashed as discussed)
            verificationCode: otp,
            verificationCodeExpires: Date.now() + 20 * 60 * 1000, // Expires in 20 mins
        });

        // Send Email
        try {
            await sendEmail({
                email: user.email,
                subject: 'Your College Marketplace Verification Code',
                message: `Your verification code is: ${otp}. It expires in 20 minutes.`,
            });
            res.status(201).json({ message: "Verification code sent to email!" });
        } catch (err) {
            console.log("NODEMAILER ERROR:", err);
            user.verificationCode = undefined;
            user.verificationCodeExpires = undefined;
            await user.save();
            return res.status(500).json({ message: "Email could not be sent" });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyEmail = async (req, res) => {
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
};
