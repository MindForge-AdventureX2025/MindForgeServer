import Chat from "../models/chat.model.js";
import { query } from "../utils/query.js";

export const createChat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const newChat = new Chat({ userId });
        await newChat.save();
        newChat.createdAt = new Date(newChat.createdAt).getTime();
        newChat.updatedAt = new Date().getTime();
        res.status(201).json(newChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getChatById = async (req, res) => {
    try {
        console.log("Fetching chat by ID");
        const userId = req.user.userId;
        const { id } = req.params;
        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (chat.userId !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        res.status(200).json({
            ...chat.toObject(),
            createdAt: new Date(chat.createdAt).getTime(),
            updatedAt: new Date(chat.updatedAt).getTime(),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getChatHistory = async (req, res) => {
    try {
        console.log("Fetching chat history");
        const userId = req.user.userId;
        console.log("User ID:", userId);
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        const chats = await Chat.find({ userId }).
        select("-messages").
        sort({ updatedAt: -1 }).
        skip(skip).
        limit(limit);
        if(!chats || chats.length === 0) {
            return res.status(404).json({ message: "No chats found" });
        }
        chats.forEach(chat => {
            chat.createdAt = new Date(chat.createdAt).getTime();
            chat.updatedAt = new Date(chat.updatedAt).getTime();
        });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateChat = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, selected = '', journalIds = [] } = req.body;
        let originalChat = await Chat.findById(id);
        originalChat.messages.push({
            sender: 'user',
            content: message,
            timestamp: new Date()
        });
        originalChat.save();
        if (!originalChat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        let resquestMessages = message;
        if(selected) {
            resquestMessages += '\nfollowing is the selected context in the journal that I would like to reference:\n' + selected;
        }
        const response = await query(resquestMessages).output_text;
        originalChat.messages.push({
            sender: 'llm',
            content: response,
            timestamp: new Date()
        });
        let ids = originalChat.messages[originalChat.messages.length - 1].journalId.filter(item => !journalIds.includes(item));
        originalChat.messages[originalChat.messages.length - 1].journalId = [...ids, ...journalIds];
        await originalChat.save();
        if (!originalChat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        originalChat.createdAt = new Date(originalChat.createdAt).getTime();
        originalChat.updatedAt = new Date(originalChat.updatedAt).getTime();
        originalChat.messages.forEach(message => {
            message.timestamp = new Date(message.timestamp).getTime();
        });
        res.status(200).json({ originalChat, response });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}