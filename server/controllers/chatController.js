import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// 1. Create or Fetch a 1-on-1 Chat
export const accessChat = async (req, res) => {
  const { userId } = req.body; // The ID of the person you want to chat with

  if (!userId) return res.status(400).send("UserId param not sent with request");

  // Check if chat exists
  var isChat = await Chat.find({
    users: { $all: [req.user.id, userId] },
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name profilePic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // Create new chat
    var chatData = {
      users: [req.user.id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).throw(error.message);
    }
  }
};

// 2. Fetch All Chats for a User
export const fetchChats = async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name profilePic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// 3. Send a Message
export const sendMessage = async (req, res) => {
  const { chatId, content, image } = req.body;

  if ((!content && !image) || !chatId) {
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user.id,
    content: content,
    image: image,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    // Populate sender and chat info for immediate frontend update
    message = await message.populate("sender", "name profilePic");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name profilePic email",
    });

    // Update Latest Message in Chat
    await Chat.findByIdAndUpdate(req.body.chatId, {
      latestMessage: message,
    });

    res.json(message);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// 4. Fetch All Messages for a specific Chat
export const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name profilePic email")
      .populate("chat");
    res.json(messages);
  } catch (error) {
    res.status(400).send(error.message);
  }
};