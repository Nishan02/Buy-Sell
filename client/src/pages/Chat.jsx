import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import EmojiPicker from 'emoji-picker-react';
import io from 'socket.io-client';
import API from '../api/axios';
import { useLocation } from 'react-router-dom';
import { 
  FaSearch, FaPaperPlane, FaEllipsisV, FaSmile, FaPaperclip, 
  FaArrowLeft, FaCheck, FaCheckDouble, FaCircle, FaTimes, FaChevronUp, FaChevronDown, FaImage
} from 'react-icons/fa';

const ENDPOINT = "http://localhost:5000"; 

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]); 

  // --- REFS FOR PERSISTENCE ---
  const socket = useRef(null); // Keep socket in ref to prevent re-connections
  const selectedChatRef = useRef(null); // Keep track of active chat for socket listener

  const location = useLocation(); 
  const user = JSON.parse(localStorage.getItem('user'));
  
  // UI States
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [inChatSearch, setInChatSearch] = useState("");
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [searchMatches, setSearchMatches] = useState([]); 
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageRefs = useRef({}); 

  // --- HELPER: GET SENDER ---
  const getSender = (loggedUser, users) => {
    if (!users || users.length < 2) return { name: "Unknown User", email: "", profilePic: "" };
    const loggedInId = loggedUser._id || loggedUser.id;
    return String(users[0]._id) === String(loggedInId) ? users[1] : users[0];
  };

  const transformChatData = (chatData) => {
    const sender = getSender(user, chatData.users);
    return {
        id: chatData._id,
        name: sender.name,
        email: sender.email,
        avatar: sender.profilePic || '',
        lastMessage: chatData.latestMessage ? chatData.latestMessage.content : "",
        time: chatData.latestMessage ? new Date(chatData.latestMessage.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "",
        unread: 0,
        users: chatData.users
    };
  };

  const transformMessage = (msg) => {
      const msgSenderId = msg.sender._id || msg.sender;
      const currentUserId = user._id || user.id;
      const isMe = String(msgSenderId) === String(currentUserId);
      
      return {
          id: msg._id || Date.now(),
          text: msg.content,
          image: msg.image,
          sender: isMe ? 'me' : 'buyer',
          time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "Just now",
          type: msg.image ? 'image' : 'text',
          status: 'read'
      };
  };

  // --- 1. INITIALIZE SOCKET ---
   // --- 1. INITIALIZE SOCKET ---
  useEffect(() => {
    // Only connect if not already connected
    if (!socket.current) {
        socket.current = io(ENDPOINT);
        socket.current.emit("setup", user);
        socket.current.on("connected", () => setSocketConnected(true));
        
        socket.current.on("online_users", (users) => {
            setOnlineUsers(users); 
        });
    }

    // --- REAL-TIME LISTENER ---
    // Remove old listener to prevent duplicates
    socket.current.off("message received");

    socket.current.on("message received", (newMessageReceived) => {
        console.log("📩 Socket Event Received:", newMessageReceived);

        // 1. SAFELY GET CHAT ID
        // The backend might send the chat as a full object OR just an ID string.
        // We handle both cases here:
        const incomingChatId = newMessageReceived.chat._id 
            ? newMessageReceived.chat._id 
            : newMessageReceived.chat;

        const activeChatId = selectedChatRef.current ? selectedChatRef.current.id : null;

        // 2. ROBUST COMPARISON
        // Convert both to String to ensure "123" matches new ObjectId("123")
        if (
            activeChatId && 
            String(activeChatId) === String(incomingChatId)
        ) {
            console.log("✅ Chat is open, appending message...");
            setMessages(prev => [...prev, transformMessage(newMessageReceived)]);
        } else {
            console.log("⚠️ Background notification only", { active: activeChatId, incoming: incomingChatId });
        }
        
        // Always refresh sidebar (to show unread dot or update last message)
        fetchChats();
    });

    // Cleanup isn't strictly necessary for the socket instance itself if you want it persistent,
    // but turning off the listener is good practice.
    return () => {
       socket.current.off("message received");
    };
  }, []); // Run once on mount

  // --- 2. HANDLE REDIRECT FROM ITEM PAGE ---
  useEffect(() => {
    if (location.state && location.state.chat) {
        const rawChat = location.state.chat;
        const formattedChat = transformChatData(rawChat);
        
        setChats(prev => {
            const exists = prev.find(c => c.id === formattedChat.id);
            if (!exists) return [formattedChat, ...prev];
            return prev;
        });

        handleSelectChat(formattedChat);
        window.history.replaceState({}, document.title);
    }
  }, [location.state]);


  const fetchChats = async () => {
    try {
        const { data } = await API.get("/chat");
        const formattedChats = data.map(chat => transformChatData(chat));
        setChats(formattedChats);
        
        const unreadCount = formattedChats.filter(c => c.unread > 0).length;
        localStorage.setItem('campusMart_unreadCount', unreadCount.toString());
        window.dispatchEvent(new Event('chat-update'));
    } catch (error) {
        console.error(error);
    }
  };

  // --- 3. UPDATED SELECT CHAT ---
  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);
    selectedChatRef.current = chat; // CRITICAL: Update Ref so socket knows current chat
    
    setIsMobileChatOpen(true);
    resetSearch();
    setLoading(true);

    try {
        const { data } = await API.get(`/chat/message/${chat.id}`);
        const formattedMessages = data.map(msg => transformMessage(msg));
        setMessages(formattedMessages);
        
        socket.current.emit("join chat", chat.id); 
    } catch (error) {
        console.error("Error loading messages", error);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Optimistic Update
    const tempMsg = {
        _id: Date.now(), 
        content: newMessage,
        sender: { _id: user._id || user.id },
        createdAt: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, transformMessage(tempMsg)]);
    setNewMessage("");
    setShowEmojiPicker(false);

    try {
        const { data } = await API.post("/chat/message", {
            content: tempMsg.content,
            chatId: selectedChat.id,
        });
        
        socket.current.emit("new message", data);
        fetchChats(); 
    } catch (error) {
        console.error("Error sending message", error);
    }
  };

  // UI Helpers (Unchanged)
  const handleFileUpload = (e) => alert("Image upload backend required.");
  const resetSearch = () => { setInChatSearch(""); setShowInChatSearch(false); setSearchMatches([]); setCurrentMatchIndex(0); };
  const onEmojiClick = (emojiObject) => setNewMessage(prev => prev + emojiObject.emoji);
  
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { if (!inChatSearch) scrollToBottom(); }, [messages, showEmojiPicker]);

  // Search Logic
  useEffect(() => {
    if (!inChatSearch.trim()) { setSearchMatches([]); return; }
    const matches = messages.map((msg, index) => (msg.text || "").toLowerCase().includes(inChatSearch.toLowerCase()) ? index : -1).filter(index => index !== -1);
    setSearchMatches(matches); setCurrentMatchIndex(matches.length > 0 ? matches.length - 1 : 0);
  }, [inChatSearch, messages]);

  const handleNextMatch = () => { if (searchMatches.length === 0) return; const nextIndex = (currentMatchIndex + 1) % searchMatches.length; setCurrentMatchIndex(nextIndex); scrollToMessage(searchMatches[nextIndex]); };
  const handlePrevMatch = () => { if (searchMatches.length === 0) return; const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length; setCurrentMatchIndex(prevIndex); scrollToMessage(searchMatches[prevIndex]); };
  const scrollToMessage = (index) => { const msgId = messages[index].id; messageRefs.current[msgId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  const renderMessageText = (text, highlight, isActive) => {
    if (!text) return ""; if (!highlight.trim() || !isActive) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span>{parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? (<span key={i} className="bg-orange-300 text-gray-900 font-bold px-0.5 rounded shadow-sm">{part}</span>) : (part))}</span>;
  };

  const isPartnerOnline = () => {
      if (!selectedChat || !selectedChat.users) return false;
      const loggedInId = user._id || user.id;
      const partner = selectedChat.users.find(u => String(u._id) !== String(loggedInId));
      return partner ? onlineUsers.includes(partner._id) : false;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 max-w-[95rem] w-full mx-auto p-0 sm:p-4 lg:p-6 h-[calc(100vh-64px)]">
        <div className="bg-white sm:rounded-2xl shadow-xl overflow-hidden h-full flex border border-gray-200">
          
          {/* SIDEBAR */}
          <div className={`${isMobileChatOpen ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 flex-col border-r border-gray-200 bg-white`}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 h-16">
              <h2 className="text-xl font-bold text-gray-800">Chats</h2>
              <button className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition"><FaEllipsisV /></button>
            </div>

            <div className="p-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></span>
                <input type="text" placeholder="Search chats..." value={sidebarSearch} onChange={(e) => setSidebarSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 text-sm transition outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {chats.filter(chat => chat.name.toLowerCase().includes(sidebarSearch.toLowerCase())).map((chat) => (
                <div key={chat.id} onClick={() => handleSelectChat(chat)} className={`flex items-center p-4 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${selectedChat?.id === chat.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      {chat.avatar ? <img src={chat.avatar} className="h-full w-full object-cover" alt="" /> : chat.name.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm font-bold truncate ${selectedChat?.id === chat.id ? 'text-indigo-900' : 'text-gray-900'}`}>{chat.name}</h3>
                      <span className={`text-xs ${chat.unread > 0 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>{chat.lastMessage}</p>
                        {chat.unread > 0 && (<span className="ml-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">{chat.unread}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN CHAT */}
          <div className={`${!isMobileChatOpen ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#f0f2f5] relative`}>
            {selectedChat ? (
              <>
                <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-20 h-16">
                  <div className="flex items-center">
                    <button onClick={() => setIsMobileChatOpen(false)} className="md:hidden mr-3 text-gray-500 hover:text-indigo-600"><FaArrowLeft className="text-xl" /></button>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 overflow-hidden">
                        {selectedChat.avatar ? <img src={selectedChat.avatar} className="h-full w-full object-cover" alt="" /> : selectedChat.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{selectedChat.name}</h3>
                        <p className="text-xs font-medium flex items-center">
                            {isPartnerOnline() ? (<span className="text-green-500 flex items-center gap-1"><FaCircle className="text-[8px]" /> Online</span>) : (<span className="text-gray-400">Offline</span>)}
                        </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-indigo-600">
                      {showInChatSearch ? (
                        <div className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-1.5 shadow-sm animate-fade-in transition-all">
                            <input autoFocus type="text" placeholder="Find..." className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none appearance-none text-sm text-gray-700 w-28 sm:w-40 placeholder-gray-400" value={inChatSearch} onChange={(e) => setInChatSearch(e.target.value)}/>
                            <button onClick={resetSearch} className="text-gray-400 hover:text-red-500 ml-2 pl-2"><FaTimes /></button>
                        </div>
                      ) : (
                        <button onClick={() => setShowInChatSearch(true)} className="hover:bg-indigo-50 p-2.5 rounded-full transition text-gray-500 hover:text-indigo-600"><FaSearch /></button>
                      )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-pattern custom-scrollbar">
                  {messages.map((msg, index) => {
                    const isCurrentMatch = searchMatches.length > 0 && searchMatches[currentMatchIndex] === index;
                    return (
                        <div key={msg.id} ref={(el) => (messageRefs.current[msg.id] = el)} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] sm:max-w-[60%] px-4 py-2 rounded-2xl shadow-sm relative group transition-all duration-300 ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'} ${isCurrentMatch ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}>
                            {msg.type === 'image' ? (<div className="mb-2"><img src={msg.image} alt="attachment" className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90" /></div>) : (<p className="text-sm leading-relaxed whitespace-pre-wrap">{renderMessageText(msg.text, inChatSearch, isCurrentMatch)}</p>)}
                            <div className={`text-[10px] mt-1 flex items-center justify-end space-x-1 ${msg.sender === 'me' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                <span>{msg.time}</span>
                                {msg.sender === 'me' && (<span className="ml-1">{msg.status === 'sent' && <FaCheck className="text-[10px]" />}{msg.status === 'read' && <FaCheckDouble className="text-[10px] text-blue-300" />}</span>)}
                            </div>
                          </div>
                        </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 sm:p-4 bg-white border-t border-gray-200 relative">
                  {showEmojiPicker && (<div className="absolute bottom-20 left-4 z-30 shadow-2xl"><EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} /></div>)}
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400 hover:text-yellow-500 transition"><FaSmile className="text-xl" /></button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-indigo-600 transition"><FaPaperclip className="text-lg" /></button>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm sm:text-base" />
                    <button type="submit" disabled={!newMessage.trim()} className={`p-3 rounded-full shadow-lg transition transform hover:scale-105 ${newMessage.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}><FaPaperPlane /></button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] text-center p-8">
                <div className="bg-white p-6 rounded-full shadow-md mb-6 animate-bounce-slow"><div className="text-indigo-200 text-6xl"><FaImage className="mx-auto" /></div></div>
                <h2 className="text-2xl font-bold text-gray-800">CampusMart Chat</h2>
                <p className="text-gray-500 mt-2 max-w-md">Select a chat to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;