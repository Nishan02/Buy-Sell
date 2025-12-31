import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // FIX 1: Assign to a local variable first to check existence
            const user = await User.findById(decoded.id).select('-password');

            // FIX 2: Check if user exists (handle deleted accounts)
            if (!user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            // FIX 3: Now we can safely check 'user.isBanned'
            if (user.isBanned) {
                if (user.banExpiresAt && new Date() > new Date(user.banExpiresAt)) {
                    // Auto-unban
                    user.isBanned = false;
                    user.banExpiresAt = null;
                    await user.save();
                } else {
                    // Still banned
                    res.status(403); // Set 403 Forbidden
                    const msg = user.banExpiresAt 
                        ? `Account suspended until ${new Date(user.banExpiresAt).toLocaleDateString()}` 
                        : 'Your account has been permanently banned.';
                    throw new Error(msg);
                }
            }

            // Attach to request and move on
            req.user = user;
            next();

        } catch (error) {
            console.error("Auth Error:", error.message);
            
            // FIX 4: Respect the status code if we set it (like 403 for bans)
            // If status is still default 200, it means it was a token error -> set 401
            const statusCode = res.statusCode === 200 ? 401 : res.statusCode;
            
            res.status(statusCode).json({ 
                message: error.message || "Not authorized, token failed" 
            });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};