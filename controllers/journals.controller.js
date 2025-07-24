import User from "../models/user.model.js";
import Journal from "../models/journal.model.js";
import { getAuth } from "@clerk/express";

export const createJournal = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title = "title", content = "content" } = req.body;
        const newJournal = new Journal({ title, content, clerkId: userId });
        await newJournal.save();
        await User.findByIdAndUpdate(userId, { $push: { journalIds: newJournal._id } });

        res.status(201).json(newJournal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getJournals = async (req, res) => {
    try {
        const journals = await Journal.find();
        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}