import Chat from "../models/chat.model.js";

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
        const chats = await Chat.find({ userId });
        res.status(200).json(chats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateChat = async (req, res) => {
    try {
        const { id } = req.params;
        const { messages } = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(id, { $push: { messages } }, { new: true });
        if (!updatedChat) {
            return res.status(404).json({ message: "Chat not found" });
        }
        res.status(200).json(updatedChat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}