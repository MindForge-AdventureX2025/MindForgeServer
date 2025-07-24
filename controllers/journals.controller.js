import User from "../models/user.model.js";
import Journal from "../models/journal.model.js";
import Version from "../models/version.model.js";

export const createJournal = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title = "untitled", content = "" } = req.body;
        const newJournal = new Journal({ title, content, userId });
        await newJournal.save();
        const version = new Version({
            journalId: newJournal._id,
            userId,
            content: content,
        });
        await version.save();
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

export const getJournalById = async (req, res) => {
    try {
        const { id } = req.params;
        const journal = await Journal.findById(id);
        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const updatedJournal = await Journal.findByIdAndUpdate(id, { title, content }, { new: true });
        if (!updatedJournal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        const version = new Version({
            journalId: updatedJournal._id,
            userId: req.user.userId,
            content: content,
        });
        await version.save();
        res.status(200).json(updatedJournal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedJournal = await Journal.findByIdAndDelete(id);
        if (!deletedJournal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        res.status(200).json({ message: "Journal deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const searchJournals = async (req, res) => {
    try {
        const { query } = req.query;
        const journals = await Journal.find({
            $and: [
                {$or: [
                    { title: new RegExp(query, 'i') },
                    { content: new RegExp(query, 'i') }
                ]},
                {userId: req.user.userId} // Ensure the search is scoped to the current user
            ]
        });
        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const addTags = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        const journal = await Journal.findById(id);
        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        journal.tags.push(...tags);
        await journal.save();
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const removeTags = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        const journal = await Journal.findById(id);
        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        journal.tags = journal.tags.filter(tag => !tags.includes(tag));
        await journal.save();
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}