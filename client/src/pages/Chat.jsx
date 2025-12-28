import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import API from '../api/axios';

const ENDPOINT = "http://localhost:5000";

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Refs for persistence in listeners
  const socket = useRef(null);
  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();

  // Helper: Get Partner Info
  const getSender = (loggedUser, users) => {
      if(!users || users.length < 2) return { name: "Unknown", pic: "" };
      return users[0]._id === loggedUser._id ? users[1] : users[0];
  };

  // --- 1. SOCKET INIT ---
  useEffect(() => {
    if (!socket.current) {
        socket.current = io(ENDPOINT);
        socket.current.emit("setup", user);
        socket.current.on("connected", () => setSocketConnected(true));
        socket.current.on("online_users", (users) => setOnlineUsers(users));
        socket.current.on("typing", () => setIsTyping(true));
        socket.current.on("stop typing", () => setIsTyping(false));
    }

    // Message Listener (Robust Version)
    socket.current.off("message received");
    socket.current.on("message received", (newMessageRecieved) => {
        const incomingChatId = newMessageRecieved.chat._id || newMessageRecieved.chat;
        const activeChatId = selectedChatRef.current ? selectedChatRef.current._id : null;

        if (activeChatId && String(activeChatId) === String(incomingChatId)) {
            setMessages(prev => [...prev, newMessageRecieved]);
        }
        // Always refresh sidebar
        fetchChats();
    });
  }, []);

  // --- 2. HANDLE REDIRECT ---
  useEffect(() => {
    if (location.state && location.state.chat) {
        const initialChat = location.state.chat;
        setChats(prev => {
            if (!prev.find(c => c._id === initialChat._id)) return [initialChat, ...prev];
            return prev;
        });
        handleSelectChat(initialChat);
    }
  }, [location.state]);

  const fetchChats = async () => {
    try {
      const { data } = await API.get("/chat");
      setChats(data);
    } catch (error) { console.error(error); }
  };

  // Load sidebar on mount
  useEffect(() => { fetchChats(); }, []);

  const handleSelectChat = async (chat) => {
      setSelectedChat(chat);
      selectedChatRef.current = chat;
      
      try {
          const { data } = await API.get(`/message/${chat._id}`);
          setMessages(data);
          socket.current.emit("join chat", chat._id);
      } catch (error) { console.error(error); }
  };

  const handleSendMessage = async (e) => {
    if (e.key === "Enter" && newMessage) {
      socket.current.emit("stop typing", selectedChat._id);
      try {
        const tempMsg = { content: newMessage, sender: user, chat: selectedChat, _id: Date.now() }; // Optimistic UI
        setNewMessage("");
        
        // Optimistic update
        // setMessages([...messages, tempMsg]); 

        const { data } = await API.post("/message", {
          content: tempMsg.content,
          chatId: selectedChat._id,
        });
        
        socket.current.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) { console.error(error); }
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected) return;
    
    // Simple typing logic
    socket.current.emit("typing", selectedChat._id);
    
    // Debounce stop typing (simplified)
    const timer = setTimeout(() => {
        socket.current.emit("stop typing", selectedChat._id);
    }, 3000);
    return () => clearTimeout(timer);
  };

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r overflow-y-auto">
            <h2 className="p-4 text-xl font-bold border-b">Chats</h2>
            {chats.map(chat => {
                const partner = getSender(user, chat.users);
                const isOnline = onlineUsers.includes(partner._id);
                return (
                    <div key={chat._id} onClick={() => handleSelectChat(chat)} 
                        className={`p-4 flex items-center cursor-pointer hover:bg-gray-50 ${selectedChat?._id === chat._id ? 'bg-blue-50' : ''}`}>
                        <div className="relative">
                            <img src={partner.pic} className="w-10 h-10 rounded-full object-cover" alt=""/>
                            {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>}
                        </div>
                        <div className="ml-3">
                            <div className="font-semibold">{partner.name}</div>
                            <div className="text-sm text-gray-500 truncate w-32">{chat.latestMessage?.content}</div>
                        </div>
                    </div>
                )
            })}
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
            {selectedChat ? (
                <>
                    <div className="p-4 border-b bg-white flex items-center">
                        <h3 className="font-bold text-lg">{getSender(user, selectedChat.users).name}</h3>
                        {onlineUsers.includes(getSender(user, selectedChat.users)._id) && 
                            <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Online</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.sender._id === user._id ? 'justify-end' : 'justify-start'}`}>
                                <span className={`px-4 py-2 rounded-lg max-w-xs ${m.sender._id === user._id ? 'bg-blue-500 text-white' : 'bg-white shadow'}`}>
                                    {m.content}
                                </span>
                            </div>
                        ))}
                        {isTyping && <div className="text-xs text-gray-400 italic">typing...</div>}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 bg-white border-t">
                        <input className="w-full border rounded-full px-4 py-2 focus:outline-blue-500" 
                            placeholder="Type a message..." 
                            value={newMessage} 
                            onChange={handleTyping} 
                            onKeyDown={handleSendMessage} />
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400">Select a chat to start</div>
            )}
        </div>
    </div>
  );
};

export default Chat;