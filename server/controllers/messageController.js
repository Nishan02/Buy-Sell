import Message from '../models/Message.js';
import User from '../models/User.js';
import Chat from '../models/Chat.js';

export const sendMessage = async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) return res.sendStatus(400);

    const newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId,
    };

    try {
        let message = await Message.create(newMessage);

        // Populate sender and chat info
        message = await message.populate("sender", "name pic");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
        });

        // Update latest message in Chat
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};

export const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
};