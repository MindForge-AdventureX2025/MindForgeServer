import Chat from "../models/chat.model.js";
import Journal from "../models/journal.model.js";
import User from "../models/user.model.js";
import { query } from "../utils/query.js";

export const createChat = async (req, res) => {
    try {
        const userId = req.user.userId;
        const newChat = new Chat({ userId });
        await newChat.save();
        newChat.createdAt = new Date(newChat.createdAt).getTime();
        newChat.updatedAt = new Date().getTime();
        await User.findByIdAndUpdate(userId, {
            $push: { chatIds: newChat._id }
        });
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
        if (chat.userId.toString() !== userId) {
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
        if(journalIds && journalIds.length > 0) {
            resquestMessages += '\n\nfollowing is the Journal that I would like to reference: {\n';
            journalIds.forEach(async journalId => {
                const { title, content } = await Journal.findById(journalId);
                resquestMessages += `\n\nJournal Title: ${title}\nJournal Content: ${content}`;
            });
            resquestMessages += '\n}';
        }
        if(selected) {
            resquestMessages += '\n\nfollowing is the selected context in the journal that I would like to reference (the selected context is what I would like to emphasize. If you need to read something, feel free to read anything I provided with you. But if you need to add, remove, or replace something, that should be inside my selected context.): {\n' + selected + '\n}';
        }
        console.log("Request Messages:", resquestMessages);
        // Assuming query is a function that interacts with an LLM or similar service
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

export const updateChatName = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userId = req.user.userId;
        const chat = await Chat.findById(id);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        if (chat.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        chat.title = name;
        await chat.save();
        res.status(200).json("Chat title updated successfully");
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteChat = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        console.log("id:", id);
        console.log("userId:", userId);
        const chat = await Chat.findById(id);
        console.log("chat:", chat);
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        console.log("chat.userId:", chat.userId);
        if (chat.userId.toString() !== userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        await Chat.findByIdAndDelete(id);
        await User.findByIdAndUpdate(userId, {
            $pull: { chatIds: id }
        });
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}