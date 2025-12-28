import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import EmojiPicker from 'emoji-picker-react';
import { 
  FaSearch, FaPaperPlane, FaPhoneAlt, FaEllipsisV, FaSmile, FaPaperclip, 
  FaArrowLeft, FaCheck, FaCheckDouble, FaCircle, FaTimes, FaChevronUp, FaChevronDown, FaImage
} from 'react-icons/fa';

// --- 1. MOCK CHAT LIST ---
const MOCK_CHATS = [
  { id: 1, name: 'Ritesh Regmi', lastMessage: 'Is the cycle still available?', time: '10:30 AM', unread: 2, online: true, avatar: '' },
  { id: 2, name: 'Anjali Gupta', lastMessage: 'Okay, I will come to collect it.', time: 'Yesterday', unread: 1, online: false, avatar: '' }, 
  { id: 3, name: 'Rahul Sharma', lastMessage: 'Can you reduce the price?', time: 'Yesterday', unread: 0, online: true, avatar: '' },
];

// --- 2. UNIQUE MESSAGES FOR EACH USER ---
const MOCK_MESSAGES_DB = {
  1: [ // Chat with Ritesh (ID: 1)
    { id: 1, text: 'Hi, is the cycle still available?', sender: 'buyer', time: '10:30 AM', type: 'text', status: 'read' },
    { id: 2, text: 'Yes, it is! When do you want to see it?', sender: 'me', time: '10:32 AM', type: 'text', status: 'read' },
    { id: 3, text: 'Can I come to Patel Hostel around 5 PM?', sender: 'buyer', time: '10:33 AM', type: 'text', status: 'read' },
    { id: 4, text: 'Sure, 5 PM works for me.', sender: 'me', time: '10:34 AM', type: 'text', status: 'read' },
  ],
  2: [ // Chat with Anjali (ID: 2)
    { id: 1, text: 'Hey, I saw your post about the engineering books.', sender: 'buyer', time: 'Yesterday', type: 'text', status: 'read' },
    { id: 2, text: 'Are they for the 2nd year?', sender: 'buyer', time: 'Yesterday', type: 'text', status: 'read' },
    { id: 3, text: 'Yes, complete set for CSE 2nd year.', sender: 'me', time: 'Yesterday', type: 'text', status: 'read' },
    { id: 4, text: 'Okay, I will come to collect it.', sender: 'buyer', time: 'Yesterday', type: 'text', status: 'read' },
  ],
  3: [ // Chat with Rahul (ID: 3)
    { id: 1, text: 'Interested in the cooler.', sender: 'buyer', time: 'Yesterday', type: 'text', status: 'read' },
    { id: 2, text: 'How old is it?', sender: 'buyer', time: 'Yesterday', type: 'text', status: 'read' },
    { id: 3, text: 'About 6 months used.', sender: 'me', time: 'Yesterday', type: 'text', status: 'read' },
    { id: 4, text: 'Can you reduce the price?', sender: 'buyer', time: 'Yesterday', type: 'text', status: 'read' },
  ]
};

const Chat = () => {
  const [chats, setChats] = useState(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]); // Current visible messages
  const [allMessages, setAllMessages] = useState(MOCK_MESSAGES_DB); // "Database" of all conversations
  const [newMessage, setNewMessage] = useState("");
  
  // Search States
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [inChatSearch, setInChatSearch] = useState("");
  const [showInChatSearch, setShowInChatSearch] = useState(false);
  const [searchMatches, setSearchMatches] = useState([]); 
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // UI States
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageRefs = useRef({}); 

  // Sync Global Unread Count
  useEffect(() => {
    const unreadCount = chats.filter(c => c.unread > 0).length;
    localStorage.setItem('campusMart_unreadCount', unreadCount.toString());
    window.dispatchEvent(new Event('chat-update'));
  }, [chats]);

  // Simulate Online/Offline Toggling
  useEffect(() => {
    const interval = setInterval(() => {
      setChats(prevChats => {
        const randomIndex = Math.floor(Math.random() * prevChats.length);
        const updatedChats = [...prevChats];
        updatedChats[randomIndex] = { ...updatedChats[randomIndex], online: !updatedChats[randomIndex].online };
        return updatedChats;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Keep selected chat online status in sync with list
  useEffect(() => {
    if (selectedChat) {
        const updatedSelected = chats.find(c => c.id === selectedChat.id);
        if (updatedSelected) setSelectedChat(prev => ({ ...prev, online: updatedSelected.online }));
    }
  }, [chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!inChatSearch) scrollToBottom();
  }, [messages, showEmojiPicker]);

  // --- UPDATED: SELECT CHAT LOGIC ---
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    
    // Load the specific messages for this user from our "Database" state
    const chatMessages = allMessages[chat.id] || [];
    setMessages(chatMessages);
    
    setIsMobileChatOpen(true);
    resetSearch();
    
    // Mark as read
    setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0 } : c));
  };

  const resetSearch = () => {
    setInChatSearch("");
    setShowInChatSearch(false);
    setSearchMatches([]);
    setCurrentMatchIndex(0);
  };

  // --- UPDATED: SEND MESSAGE LOGIC ---
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const msg = {
      id: Date.now(),
      text: newMessage,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      status: 'sent' 
    };

    // 1. Update current view
    setMessages(prev => [...prev, msg]);
    
    // 2. Update the "Database" so messages persist if we switch chats
    setAllMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), msg]
    }));

    setNewMessage("");
    setShowEmojiPicker(false);
    updateSidebar(msg.text);

    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    const imageUrl = URL.createObjectURL(file);
    const msg = {
        id: Date.now(),
        text: 'Sent an image',
        image: imageUrl,
        sender: 'me',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'image',
        status: 'sent'
    };

    setMessages(prev => [...prev, msg]);
    setAllMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), msg]
    }));

    updateSidebar('📷 Image');
    
    setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
    }, 1500);
  };

  const updateSidebar = (lastMsg) => {
    setChats(prevChats => {
        const updatedChats = [...prevChats];
        const chatIndex = updatedChats.findIndex(c => c.id === selectedChat.id);
        if (chatIndex > -1) {
          const chat = { ...updatedChats[chatIndex], lastMessage: lastMsg, time: 'Just now' };
          updatedChats.splice(chatIndex, 1);
          updatedChats.unshift(chat);
        }
        return updatedChats;
      });
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prev => prev + emojiObject.emoji);
  };

  // Search Logic
  useEffect(() => {
    if (!inChatSearch.trim()) {
      setSearchMatches([]);
      return;
    }
    const matches = messages
      .map((msg, index) => msg.text.toLowerCase().includes(inChatSearch.toLowerCase()) ? index : -1)
      .filter(index => index !== -1);
    
    setSearchMatches(matches);
    setCurrentMatchIndex(matches.length > 0 ? matches.length - 1 : 0);
  }, [inChatSearch, messages]);

  const handleNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIndex);
    scrollToMessage(searchMatches[nextIndex]);
  };

  const handlePrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIndex = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIndex);
    scrollToMessage(searchMatches[prevIndex]);
  };

  const scrollToMessage = (index) => {
    const msgId = messages[index].id;
    messageRefs.current[msgId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const renderMessageText = (text, highlight, isActive) => {
    if (!highlight.trim() || !isActive) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-orange-300 text-gray-900 font-bold px-0.5 rounded shadow-sm">{part}</span>
          ) : ( part )
        )}
      </span>
    );
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
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-indigo-500 text-sm transition outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {chats
                .filter(chat => chat.name.toLowerCase().includes(sidebarSearch.toLowerCase()))
                .map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={`flex items-center p-4 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${selectedChat?.id === chat.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''}`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {chat.avatar ? <img src={chat.avatar} className="h-full w-full rounded-full" alt="" /> : chat.name.charAt(0)}
                    </div>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"></span>
                    )}
                  </div>
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm font-bold truncate ${selectedChat?.id === chat.id ? 'text-indigo-900' : 'text-gray-900'}`}>{chat.name}</h3>
                      <span className={`text-xs ${chat.unread > 0 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}>{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={`text-sm truncate ${chat.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                            {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                            <span className="ml-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                                {chat.unread}
                            </span>
                        )}
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
                {/* Header */}
                <div className="p-3 sm:p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-20 h-16">
                  <div className="flex items-center">
                    <button onClick={() => setIsMobileChatOpen(false)} className="md:hidden mr-3 text-gray-500 hover:text-indigo-600">
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-3">
                        {selectedChat.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">{selectedChat.name}</h3>
                        <p className="text-xs font-medium flex items-center">
                            {selectedChat.online ? (
                                <span className="text-green-500 flex items-center"><FaCircle className="text-[8px] mr-1" /> Online</span>
                            ) : (
                                <span className="text-gray-400">Offline</span>
                            )}
                        </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-2 text-indigo-600">
                    {showInChatSearch ? (
                        <div className="flex items-center bg-white border border-gray-300 rounded-full px-3 py-1.5 shadow-sm animate-fade-in transition-all">
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Find..."
                                className="bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none appearance-none text-sm text-gray-700 w-28 sm:w-40 placeholder-gray-400"
                                value={inChatSearch}
                                onChange={(e) => setInChatSearch(e.target.value)}
                            />
                            {inChatSearch && (
                                <div className="flex items-center text-xs text-gray-500 border-l border-gray-300 pl-2 ml-2">
                                    <span className="mr-2 whitespace-nowrap font-medium">
                                        {searchMatches.length > 0 ? `${currentMatchIndex + 1}/${searchMatches.length}` : '0/0'}
                                    </span>
                                    <div className="flex space-x-1">
                                      <button onClick={handlePrevMatch} className="hover:bg-gray-100 p-1 rounded transition text-gray-600 hover:text-indigo-600"><FaChevronUp /></button>
                                      <button onClick={handleNextMatch} className="hover:bg-gray-100 p-1 rounded transition text-gray-600 hover:text-indigo-600"><FaChevronDown /></button>
                                    </div>
                                </div>
                            )}
                            <button onClick={resetSearch} className="text-gray-400 hover:text-red-500 ml-2 pl-2">
                                <FaTimes />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setShowInChatSearch(true)} className="hover:bg-indigo-50 p-2.5 rounded-full transition text-gray-500 hover:text-indigo-600" title="Search in chat">
                            <FaSearch />
                        </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-chat-pattern custom-scrollbar">
                  {messages.map((msg, index) => {
                    const isCurrentMatch = searchMatches.length > 0 && searchMatches[currentMatchIndex] === index;
                    return (
                        <div key={msg.id} ref={(el) => (messageRefs.current[msg.id] = el)} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] sm:max-w-[60%] px-4 py-2 rounded-2xl shadow-sm relative group transition-all duration-300 ${msg.sender === 'me' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'} ${isCurrentMatch ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}>
                            {msg.type === 'image' ? (
                                <div className="mb-2"><img src={msg.image} alt="attachment" className="rounded-lg max-h-48 object-cover cursor-pointer hover:opacity-90" /></div>
                            ) : (
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{renderMessageText(msg.text, inChatSearch, isCurrentMatch)}</p>
                            )}
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

                {/* Input */}
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