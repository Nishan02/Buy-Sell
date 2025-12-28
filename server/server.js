import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http'; 
import { Server } from 'socket.io';  
import connectDB from './config/db.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import userRoutes from './routes/userRoutes.js';
import lostFoundRoutes from './routes/lostFoundRoutes.js';
import chatRoutes from './routes/chatRoutes.js';      // Ensure filename matches your project
import messageRoutes from './routes/messageRoutes.js'; // <--- NEW: Required for sending messages

// Connect to Database
connectDB();

const app = express();

// --- 1. DEFINE ALLOWED ORIGINS ---
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];

// --- 2. UPDATE EXPRESS CORS ---
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads')); 

// Register Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/chat', chatRoutes); 
app.use('/api/message', messageRoutes); // <--- NEW: Route for handling messages

app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- 3. SOCKET.IO SETUP ---
// We must wrap the Express app with the HTTP server for Socket.io to work
const httpServer = createServer(app);

const io = new Server(httpServer, {
    pingTimeout: 60000,
    cors: {
        origin: allowedOrigins,
        credentials: true,
    }
});

// Store online users: Map<UserId, SocketId>
const onlineUsers = new Map(); 

io.on('connection', (socket) => {
    console.log('🔗 New Socket Connection:', socket.id);

    // A. User Setup (Join personal room & go online)
    socket.on('setup', (userData) => {
        if (!userData) return;
        socket.join(userData._id);
        
        onlineUsers.set(userData._id, socket.id);
        console.log(`✅ User Connected: ${userData.name} (${userData._id})`);
        
        socket.emit('connected');
        io.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // B. Join Chat Room
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('👥 User Joined Room: ' + room);
    });

    // C. Handle New Messages
    socket.on('new message', (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log('Chat.users not defined');

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return; // Don't send to self
            
            // Send to the specific user's room
            socket.in(user._id).emit('message received', newMessageReceived);
        });
    });

    // D. Typing Indicators
    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    // E. Disconnect
    socket.on('disconnect', () => {
        // Remove user from online map
        for (let [key, value] of onlineUsers.entries()) {
            if (value === socket.id) {
                onlineUsers.delete(key);
                break;
            }
        }
        // Broadcast new online list
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log('❌ Socket Disconnected');
    });
});

const PORT = process.env.PORT || 5000;

// Note: Use httpServer.listen, NOT app.listen
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));