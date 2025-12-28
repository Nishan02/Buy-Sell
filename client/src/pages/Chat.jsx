import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import API from '../api/axios'; // Ensure this path is correct
// import Navbar from '../components/Navbar'; // Uncomment if you have a navbar

const ENDPOINT = "http://localhost:5000";

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // --- REFS ---
  const socket = useRef(null);
  const selectedChatRef = useRef(null); // Keeps track of active chat for socket
  const messagesEndRef = useRef(null);

  const location = useLocation();

  // --- 1. HELPER: SAFE ID RETRIEVAL ---
  // This fixes the issue where IDs might be '_id' or 'id'
  const getUserId = (u) => {
    if (!u) return null;
    return u._id || u.id || u.userId;
  };

  // Get current logged-in user safely
  // Try 'user' first, then 'userInfo' (common mismatch fix)
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("userInfo"));
  const loggedInUserId = getUserId(user);

  // --- HELPER: GET PARTNER INFO ---
  const getSender = (loggedUser, users) => {
    if (!users || users.length < 2) return { name: "Unknown User", pic: "" };
    
    const myId = getUserId(loggedUser);
    const user0Id = getUserId(users[0]);

    // If I am user[0], return user[1]. Otherwise return user[0].
    return String(user0Id) === String(myId) ? users[1] : users[0];
  };

  // --- 2. ROBUST SOCKET INITIALIZATION ---
  useEffect(() => {
    if (!loggedInUserId) {
        console.error("❌ No User ID found. Please log in.");
        return;
    }

    // A. Initialize
    socket.current = io(ENDPOINT);

    // B. Setup Logic
    const setupSocket = () => {
        console.log("🔌 Running Socket Setup for User:", loggedInUserId);
        socket.current.emit("setup", { _id: loggedInUserId });
    };

    // C. Connection Listeners
    socket.current.on("connect", () => {
        console.log("✅ Socket Connected (ID: " + socket.current.id + ")");
        setupSocket(); 
        setSocketConnected(true);
    });

    socket.current.on("online_users", (users) => setOnlineUsers(users));
    socket.current.on("typing", () => setIsTyping(true));
    socket.current.on("stop typing", () => setIsTyping(false));

    // D. Message Listener
    socket.current.on("message received", (newMessageRecieved) => {
        const incomingChatId = getUserId(newMessageRecieved.chat) || newMessageRecieved.chat;
        const activeChatId = selectedChatRef.current ? getUserId(selectedChatRef.current) : null;

        // Strict String Comparison
        if (activeChatId && String(activeChatId) === String(incomingChatId)) {
            setMessages(prev => [...prev, newMessageRecieved]);
        }
        // Always refresh sidebar
        fetchChats();
    });

    // E. Safety Timer (Forces setup if 'connect' event was missed)
    const timer = setTimeout(() => {
        if (socket.current.connected) setupSocket();
    }, 1000);

    return () => {
        clearTimeout(timer);
        if(socket.current) socket.current.disconnect();
    };
  }, [loggedInUserId]);

  // --- 3. HANDLE REDIRECT FROM OTHER PAGES ---
  useEffect(() => {
    if (location.state && location.state.chat) {
        const initialChat = location.state.chat;
        setChats(prev => {
            // Avoid duplicates
            if (!prev.find(c => String(getUserId(c)) === String(getUserId(initialChat)))) {
                return [initialChat, ...prev];
            }
            return prev;
        });
        handleSelectChat(initialChat);
    }
  }, [location.state]);

  // --- API CALLS ---
  const fetchChats = async () => {
    try {
      const { data } = await API.get("/chat");
      setChats(data);
    } catch (error) { console.error("Error fetching chats:", error); }
  };

  useEffect(() => { fetchChats(); }, []);

  const handleSelectChat = async (chat) => {
      setSelectedChat(chat);
      selectedChatRef.current = chat; // Update Ref for socket
      
      try {
          const { data } = await API.get(`/message/${getUserId(chat)}`);
          setMessages(data);
          socket.current.emit("join chat", getUserId(chat));
      } catch (error) { console.error("Error fetching messages:", error); }
  };

  const handleSendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      if(!selectedChat) return;

      const chatId = getUserId(selectedChat);
      socket.current.emit("stop typing", chatId);
      
      try {
        setNewMessage("");
        const { data } = await API.post("/message", {
          content: newMessage,
          chatId: chatId,
        });
        
        socket.current.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) { console.error("Error sending message:", error); }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected || !selectedChat) return;
    
    const chatId = getUserId(selectedChat);
    socket.current.emit("typing", chatId);
    
    // Debounce stop typing
    const timer = setTimeout(() => {
        socket.current.emit("stop typing", chatId);
    }, 3000);
    return () => clearTimeout(timer);
  };

  // Auto-scroll to bottom
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- RENDER ---
  if (!user) return <div className="p-10 text-center text-red-500">Please Log In to Chat</div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
        {/* SIDEBAR */}
        <div className="w-full md:w-1/3 bg-white border-r overflow-y-auto">
            <h2 className="p-4 text-xl font-bold border-b text-gray-800">Messages</h2>
            {chats.map(chat => {
                const partner = getSender(user, chat.users);
                const partnerId = getUserId(partner);
                const isOnline = onlineUsers.includes(partnerId);
                const isActive = selectedChat && getUserId(selectedChat) === getUserId(chat);

                return (
                    <div 
                        key={getUserId(chat)} 
                        onClick={() => handleSelectChat(chat)} 
                        className={`p-4 flex items-center cursor-pointer transition-colors hover:bg-gray-50 ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                    >
                        <div className="relative">
                            <img src={partner.pic} className="w-12 h-12 rounded-full object-cover border border-gray-200" alt="avatar"/>
                            {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                        </div>
                        <div className="ml-4 flex-1 overflow-hidden">
                            <div className="font-semibold text-gray-900">{partner.name}</div>
                            <div className="text-sm text-gray-500 truncate">
                                {chat.latestMessage ? chat.latestMessage.content : <span className="italic">Click to start chatting</span>}
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>

        {/* CHAT AREA */}
        <div className="hidden md:flex w-2/3 flex-col bg-[#efeae2]">
            {selectedChat ? (
                <>
                    {/* Header */}
                    <div className="p-4 bg-white border-b flex items-center shadow-sm z-10">
                        <img src={getSender(user, selectedChat.users).pic} className="w-10 h-10 rounded-full mr-3" alt="" />
                        <div>
                            <h3 className="font-bold text-gray-800">{getSender(user, selectedChat.users).name}</h3>
                            {onlineUsers.includes(getUserId(getSender(user, selectedChat.users))) && 
                                <span className="text-xs text-green-600 font-medium">Online</span>}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((m, i) => {
                            // FIX: Correctly Identify "Me" vs "Them"
                            const isMe = String(getUserId(m.sender)) === String(loggedInUserId);
                            
                            return (
                                <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] px-4 py-2 rounded-lg shadow-sm text-sm ${
                                        isMe ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
                                    }`}>
                                        {m.content}
                                    </div>
                                </div>
                            )
                        })}
                        {isTyping && <div className="text-xs text-gray-500 italic ml-4">typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-gray-100 border-t">
                        <input 
                            className="w-full border-none rounded-full px-6 py-3 focus:ring-2 focus:ring-blue-500 shadow-sm" 
                            placeholder="Type a message..." 
                            value={newMessage} 
                            onChange={handleTyping} 
                            onKeyDown={handleSendMessage} 
                        />
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-xl">Select a chat to start messaging</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Chat;