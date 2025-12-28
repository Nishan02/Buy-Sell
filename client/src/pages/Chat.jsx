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
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // UI States
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [inChatSearch, setInChatSearch] = useState("");
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [searchMatches, setSearchMatches] = useState([]); 
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // --- REFS ---
  const socket = useRef(null);
  const selectedChatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageRefs = useRef({});

  const location = useLocation();

  // --- 1. HELPER: SAFE ID RETRIEVAL ---
  const getUserId = (u) => {
    if (!u) return null;
    return u._id || u.id || u.userId;
  };

  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(localStorage.getItem("userInfo"));
  const loggedInUserId = getUserId(user);

  // --- HELPER: GET PARTNER INFO ---
  const getSender = (loggedUser, users) => {
    if (!users || users.length < 2) return { name: "Unknown User", pic: "", profilePic: "" };
    
    const myId = getUserId(loggedUser);
    const user0Id = getUserId(users[0]);

    // Robust comparison
    return String(user0Id) === String(myId) ? users[1] : users[0];
  };

  // --- 2. ROBUST SOCKET INITIALIZATION (Keep Logic Unchanged) ---
  useEffect(() => {
    if (!loggedInUserId) return;

    socket.current = io(ENDPOINT);

    const setupSocket = () => {
        socket.current.emit("setup", { _id: loggedInUserId });
    };

    socket.current.on("connect", () => {
        setupSocket(); 
        setSocketConnected(true);
    });

    socket.current.on("online_users", (users) => setOnlineUsers(users));
    socket.current.on("typing", () => setIsTyping(true));
    socket.current.on("stop typing", () => setIsTyping(false));

    socket.current.on("message received", (newMessageRecieved) => {
        const incomingChatId = getUserId(newMessageRecieved.chat) || newMessageRecieved.chat;
        const activeChatId = selectedChatRef.current ? getUserId(selectedChatRef.current) : null;

        if (activeChatId && String(activeChatId) === String(incomingChatId)) {
            setMessages(prev => [...prev, newMessageRecieved]);
        }
        fetchChats();
    });

    const timer = setTimeout(() => {
        if (socket.current.connected) setupSocket();
    }, 1000);

    return () => {
        clearTimeout(timer);
        if(socket.current) socket.current.disconnect();
    };
  }, [loggedInUserId]);

  // --- 3. HANDLE REDIRECT ---
  useEffect(() => {
    if (location.state && location.state.chat) {
        const initialChat = location.state.chat;
        setChats(prev => {
            if (!prev.find(c => String(getUserId(c)) === String(getUserId(initialChat)))) {
                return [initialChat, ...prev];
            }
            return prev;
        });
        handleSelectChat(initialChat);
        // Clean history state
        window.history.replaceState({}, document.title);
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
      selectedChatRef.current = chat;
      setIsMobileChatOpen(true); // Open mobile view
      
      try {
          const { data } = await API.get(`/message/${getUserId(chat)}`);
          setMessages(data);
          socket.current.emit("join chat", getUserId(chat));
      } catch (error) { console.error("Error fetching messages:", error); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent form reload
    if (!newMessage.trim() || !selectedChat) return;

    const chatId = getUserId(selectedChat);
    socket.current.emit("stop typing", chatId);
    
    // Optimistic Update UI
    const tempMsg = {
        _id: Date.now(),
        content: newMessage,
        sender: { _id: loggedInUserId },
        chat: selectedChat,
        createdAt: new Date().toISOString()
    };
    
    // Clear input first
    const msgToSend = newMessage;
    setNewMessage("");
    setShowEmojiPicker(false);

    try {
        // Optimistically add to UI
        setMessages(prev => [...prev, tempMsg]);

        const { data } = await API.post("/message", {
            content: msgToSend,
            chatId: chatId,
        });
        
        socket.current.emit("new message", data);
        // Replace temp message with real one if needed, or just append
        // Since we optimistic update, we might get a duplicate if we don't filter, 
        // but typically the socket event won't fire for self in this logic setup.
    } catch (error) { console.error("Error sending message:", error); }
  };

  // Typing Handler
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!socketConnected || !selectedChat) return;
    
    const chatId = getUserId(selectedChat);
    socket.current.emit("typing", chatId);
    
    const timer = setTimeout(() => {
        socket.current.emit("stop typing", chatId);
    }, 3000);
    return () => clearTimeout(timer);
  };

  // --- UI HELPERS ---
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, showEmojiPicker]);

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  const handleFileUpload = () => alert("Image upload backend required");

  // Search Logic (Visual only)
  useEffect(() => {
    if (!inChatSearch.trim()) { setSearchMatches([]); return; }
    const matches = messages.map((msg, index) => (msg.content || "").toLowerCase().includes(inChatSearch.toLowerCase()) ? index : -1).filter(index => index !== -1);
    setSearchMatches(matches); setCurrentMatchIndex(matches.length > 0 ? matches.length - 1 : 0);
  }, [inChatSearch, messages]);

  const handleNextMatch = () => { if (searchMatches.length === 0) return; const nextIndex = (currentMatchIndex + 1) % searchMatches.length; setCurrentMatchIndex(nextIndex); scrollToMessage(searchMatches[nextIndex]); };
  const handlePrevMatch = () => { if (searchMatches.length === 0) return; const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length; setCurrentMatchIndex(prevIndex); scrollToMessage(searchMatches[prevIndex]); };
  const scrollToMessage = (index) => { const msgId = messages[index]._id; messageRefs.current[msgId]?.scrollIntoView({ behavior: 'smooth', block: 'center' }); };

  const renderMessageText = (text, highlight, isActive) => {
    if (!text) return ""; if (!highlight.trim() || !isActive) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return <span>{parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? (<span key={i} className="bg-orange-300 text-gray-900 font-bold px-0.5 rounded shadow-sm">{part}</span>) : (part))}</span>;
  };

  if (!user) return <div className="p-10 text-center text-red-500">Please Log In to Chat</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans overflow-hidden">
      <Navbar />

      <div className="flex-1 max-w-[95rem] w-full mx-auto p-0 sm:p-4 lg:p-6 h-[calc(100vh-64px)]">
        <div className="bg-white sm:rounded-2xl shadow-xl overflow-hidden h-full flex border border-gray-200">
          
          {/* --- SIDEBAR --- */}
          <div className={`${isMobileChatOpen ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 flex-col border-r border-gray-200 bg-white`}>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 h-16">
              <h2 className="text-xl font-bold text-gray-800">Chats</h2>
              <button className="p-2 rounded-full hover:bg-gray-200 text-gray-500 transition"><FaEllipsisV /></button>
            </div>

            {/* Search Bar */}
            <div className="p-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><FaSearch className="text-gray-400" /></span>
                <input 
                    type="text" 
                    placeholder="Search chats..." 
                    value={sidebarSearch} 
                    onChange={(e) => setSidebarSearch(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 text-sm transition outline-none" 
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {chats.filter(c => {
                  const p = getSender(user, c.users);
                  return p.name.toLowerCase().includes(sidebarSearch.toLowerCase());
              }).map((chat) => {
                const partner = getSender(user, chat.users);
                const partnerId = getUserId(partner);
                const isOnline = onlineUsers.includes(partnerId);
                const isActive = selectedChat && getUserId(selectedChat) === getUserId(chat);

                return (
                <div 
                  key={getUserId(chat)}
                  onClick={() => handleSelectChat(chat)}
                  className={`flex items-center p-4 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${isActive ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                      {partner.profilePic || partner.pic ? <img src={partner.profilePic || partner.pic} className="h-full w-full object-cover" alt="" /> : partner.name.charAt(0)}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm font-bold truncate ${isActive ? 'text-indigo-900' : 'text-gray-900'}`}>{partner.name}</h3>
                      <span className="text-xs text-gray-400">
                          {chat.latestMessage ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ""}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={`text-sm truncate ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                            {chat.latestMessage ? chat.latestMessage.content : "Start chatting"}
                        </p>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* --- MAIN CHAT WINDOW --- */}
          <div className={`${!isMobileChatOpen ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#f0f2f5] relative`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-20 h-16">
                  <div className="flex items-center">
                    <button onClick={() => setIsMobileChatOpen(false)} className="md:hidden mr-3 text-gray-500 hover:text-indigo-600"><FaArrowLeft className="text-xl" /></button>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3 overflow-hidden">
                        {getSender(user, selectedChat.users).pic ? <img src={getSender(user, selectedChat.users).pic} className="h-full w-full object-cover" alt="" /> : getSender(user, selectedChat.users).name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{getSender(user, selectedChat.users).name}</h3>
                        <p className="text-xs font-medium flex items-center">
                            {onlineUsers.includes(getUserId(getSender(user, selectedChat.users))) ? 
                                <span className="text-green-500 flex items-center gap-1"><FaCircle className="text-[8px]" /> Online</span> : 
                                <span className="text-gray-400">Offline</span>
                            }
                        </p>
                    </div>
                  </div>
                  
                  {/* Header Actions (Search) */}
                  <div className="flex items-center space-x-2 text-indigo-600">
                    {showInChatSearch ? (
                        <div className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-1.5 shadow-sm animate-fade-in transition-all">
                            <input autoFocus type="text" placeholder="Find..." className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none appearance-none text-sm text-gray-700 w-28 sm:w-40 placeholder-gray-400" value={inChatSearch} onChange={(e) => setInChatSearch(e.target.value)} />
                            <div className="flex items-center text-xs text-gray-500 border-l border-gray-300 pl-2 ml-2">
                                <span className="mr-2">{searchMatches.length > 0 ? `${currentMatchIndex + 1}/${searchMatches.length}` : '0/0'}</span>
                                <button onClick={handlePrevMatch} className="hover:bg-gray-100 p-1 rounded text-gray-600"><FaChevronUp /></button>
                                <button onClick={handleNextMatch} className="hover:bg-gray-100 p-1 rounded text-gray-600"><FaChevronDown /></button>
                            </div>
                            <button onClick={() => {setShowInChatSearch(false); setInChatSearch("")}} className="text-gray-400 hover:text-red-500 ml-2 pl-2"><FaTimes /></button>
                        </div>
                    ) : (
                        <button onClick={() => setShowInChatSearch(true)} className="hover:bg-indigo-50 p-2.5 rounded-full transition text-gray-500 hover:text-indigo-600"><FaSearch /></button>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-pattern custom-scrollbar">
                  {messages.map((msg, index) => {
                    const isMe = String(getUserId(msg.sender)) === String(loggedInUserId);
                    const isCurrentMatch = searchMatches.length > 0 && searchMatches[currentMatchIndex] === index;
                    
                    return (
                        <div key={index} ref={(el) => (messageRefs.current[msg._id] = el)} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] sm:max-w-[60%] px-4 py-2 rounded-2xl shadow-sm relative group transition-all duration-300 ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'} ${isCurrentMatch ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}>
                            {/* If msg.image logic exists... */}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderMessageText(msg.content, inChatSearch, isCurrentMatch)}</p>
                            <div className={`text-[10px] mt-1 flex items-center justify-end space-x-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                                <span>{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : "Just now"}</span>
                                {isMe && (<span className="ml-1"><FaCheckDouble className="text-[10px] text-blue-300" /></span>)}
                            </div>
                          </div>
                        </div>
                    );
                  })}
                  {isTyping && <div className="text-xs text-gray-500 italic ml-4 mb-2 animate-pulse">Partner is typing...</div>}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 sm:p-4 bg-white border-t border-gray-200 relative">
                  {showEmojiPicker && (
                      <div className="absolute bottom-20 left-4 z-30 shadow-2xl">
                          <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
                      </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-400 hover:text-yellow-500 transition"><FaSmile className="text-xl" /></button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-gray-400 hover:text-indigo-600 transition"><FaPaperclip className="text-lg" /></button>
                    
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={handleTyping} 
                        placeholder="Type a message..." 
                        className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm sm:text-base" 
                    />
                    
                    <button type="submit" disabled={!newMessage.trim()} className={`p-3 rounded-full shadow-lg transition transform hover:scale-105 ${newMessage.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                      <FaPaperPlane />
                    </button>
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