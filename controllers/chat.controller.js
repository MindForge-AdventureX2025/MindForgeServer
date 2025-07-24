import Chat from "../models/chat.model.js";
import { query } from "../utils/query.js";

export const createChat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const newChat = new Chat({ userId });
        await newChat.save();
        res.status(201).json(newChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getChatById = async (req, res) => {
    try {
        const { id } = req.params;
        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json(chat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getChatHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        const chats = await Chat.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateChat = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, selected = '' } = req.body;
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
        await originalChat.save();
        if (!originalChat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json({ originalChat, response });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}