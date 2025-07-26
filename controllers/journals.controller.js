import User from "../models/user.model.js";
import Journal from "../models/journal.model.js";
import Version from "../models/version.model.js";

export const createJournal = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title = "untitled", content = "" } = req.body;
        let newJournal = new Journal({ title, content, userId, nonTitleUpdatedAt: new Date() });
        await newJournal.save();
        const version = new Version({
            journalId: newJournal._id,
            userId,
            content: content,
        });
        await version.save();
        await User.findByIdAndUpdate(userId, { $push: { journalIds: newJournal._id } });
        newJournal.createdAt = new Date(newJournal.createdAt).getTime();
        newJournal.updatedAt = new Date().getTime();
        newJournal = {
            ...newJournal.toObject(),
            nonTitleUpdatedAt: new Date(newJournal.nonTitleUpdatedAt).getTime(),
        }
        res.status(201).json(newJournal);
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const getJournals = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        const journals = await Journal.find({ userId }).sort({ updatedAt: -1 }).skip(skip).limit(limit);
        journals.forEach(journal => {
            journal.createdAt = new Date(journal.createdAt);
            journal.createdAt = journal.createdAt.getTime();
            journal.updatedAt = new Date(journal.updatedAt);
            journal.updatedAt = journal.updatedAt.getTime();
            journal.nonTitleUpdatedAt = new Date(journal.nonTitleUpdatedAt);
            journal.nonTitleUpdatedAt = journal.nonTitleUpdatedAt.getTime();
        });
        res.status(200).json(journals);
    } catch (error) {
        console.log("error: ", error);
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
        if (journal.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        journal.createdAt = new Date(journal.createdAt).getTime();
        journal.updatedAt = new Date(journal.updatedAt).getTime();
        res.status(200).json({
            ...journal.toObject(),
            createdAt: journal.createdAt,
            updatedAt: journal.updatedAt,
            nonTitleUpdatedAt: new Date(journal.nonTitleUpdatedAt).getTime(),
        });
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const updateJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const updatedJournal = await Journal.findByIdAndUpdate(id, { title, content, nonTitleUpdatedAt: new Date().getTime() }, { new: true });
        if (!updatedJournal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        const version = new Version({
            journalId: updatedJournal._id,
            userId: req.user.userId,
            content: content,
        });
        await version.save();
        updatedJournal.createdAt = new Date(updatedJournal.createdAt).getTime();
        updatedJournal.updatedAt = new Date(updatedJournal.updatedAt).getTime();
        updatedJournal.nonTitleUpdatedAt = new Date(updatedJournal.nonTitleUpdatedAt).getTime();
        res.status(200).json(updatedJournal);
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const searchJournals = async (req, res) => {
    try {
        const { keyword, tags = '', from, to } = req.query;
        let dateFrom = from ? new Date(from) : new Date(0); // Default to the beginning of time if no 'from' date is provided
        let dateTo = to ? new Date(to) : new Date(); // Default to the current date if no 'to' date is provided
        
        // Build search query
        let searchQuery = {
            userId: req.user.userId,
            nonTitleUpdatedAt: { $gte: dateFrom, $lte: dateTo }
        };
        
        // Add keyword search if provided
        if (keyword) {
            searchQuery.$or = [
                { title: new RegExp(keyword, 'i') },
                { content: new RegExp(keyword, 'i') }
            ];
        }
        
        // Add tags filter if provided
        if (tags && tags.trim() !== '') {
            searchQuery.tags = { $in: tags.split(',').map(tag => tag.trim()) };
        }
        
        const journals = await Journal.find(searchQuery)
            .sort({ updatedAt: -1 }) // Sort by most recent updates
            .populate('userId', 'firstName lastName username avatarUrl');
            
        if (journals.length === 0) {
            return res.status(404).json({ message: "No journals found" });
        }
        
        journals.forEach(journal => {
            journal.createdAt = new Date(journal.createdAt).getTime();
            journal.updatedAt = new Date(journal.updatedAt).getTime();
            journal.nonTitleUpdatedAt = new Date(journal.nonTitleUpdatedAt).getTime();
        });
        res.status(200).json(journals);
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const addTags = async (req, res) => {
    try {
        const { journalId, tags } = req.body;
        if (!journalId || !tags || !Array.isArray(tags)) {
            return res.status(400).json({ message: "journalId and tags array are required" });
        }
        
        const journal = await Journal.findById(journalId);
        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        
        if (journal.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        // Add new tags (avoid duplicates)
        const existingTags = journal.tags || [];
        const newTags = tags.filter(tag => !existingTags.includes(tag));
        journal.tags = [...existingTags, ...newTags];
        
        await journal.save();
        const version = new Version({
            journalId: journal._id,
            userId: req.user.userId,
            content: journal.content,
            tags: journal.tags,
        });
        await version.save();
        
        journal.createdAt = new Date(journal.createdAt).getTime();
        journal.updatedAt = new Date(journal.updatedAt).getTime();
        res.status(200).json({
            ...journal.toObject(),
            createdAt: journal.createdAt,
            updatedAt: journal.updatedAt,
            nonTitleUpdatedAt: new Date(journal.nonTitleUpdatedAt).getTime(),
        });
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const removeTags = async (req, res) => {
    try {
        const { journalId, tags } = req.body;
        if (!journalId || !tags || !Array.isArray(tags)) {
            return res.status(400).json({ message: "journalId and tags array are required" });
        }
        
        const journal = await Journal.findById(journalId);
        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        
        if (journal.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        
        journal.tags = journal.tags.filter(tag => !tags.includes(tag));
        await journal.save();
        const version = new Version({
            journalId: journal._id,
            userId: req.user.userId,
            content: journal.content,
            tags: journal.tags,
        });
        await version.save();
        journal.createdAt = new Date(journal.createdAt).getTime();
        journal.updatedAt = new Date(journal.updatedAt).getTime();
        res.status(200).json({
            ...journal.toObject(),
            createdAt: journal.createdAt,
            updatedAt: journal.updatedAt,
            nonTitleUpdatedAt: new Date(journal.nonTitleUpdatedAt).getTime(),
        });
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const getJournalVersions = async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        const versions = await Version.find({ journalId: id }).sort({ createdAt: -1 }).skip(skip).limit(limit);
        if (!versions || versions.length === 0) {
            return res.status(404).json({ message: "No versions found for this journal" });
        }
        versions.forEach(version => {
            version.createdAt = new Date(version.createdAt).getTime();
            version.updatedAt = new Date(version.updatedAt).getTime();
            version.nonTitleUpdatedAt = new Date(version.nonTitleUpdatedAt).getTime();
        });
        res.status(200).json(versions);
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const getJournalHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        const journals = await Journal.find({ userId }).select("-content").sort({ nonTitleUpdatedAt: -1 }).skip(skip).limit(limit);
        if (!journals || journals.length === 0) {
            return res.status(404).json({ message: "No journals found" });
        }
        const returnValues =  journals.map(journal => {
            return { ...journal.toObject(),
                createdAt: new Date(journal.createdAt).getTime(),
                updatedAt: new Date(journal.updatedAt).getTime(),
                nonTitleUpdatedAt: new Date(journal.nonTitleUpdatedAt).getTime()
            };
            
        });
        res.status(200).json(returnValues);
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const setVersionById = async (req, res) => {
    try {
        const { id } = req.params;
        const { versionId } = req.body;
        const journal = await Journal.findById(id);
        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        const version = await Version.findById(versionId);
        if (!version || version.journalId.toString() !== id) {
            return res.status(404).json({ message: "Version not found" });
        }
        journal.content = version.content;
        journal.title = version.title;
        journal.nonTitleUpdatedAt = new Date().getTime();
        await journal.save();
        res.status(200).json({
            ...journal.toObject(),
            createdAt: new Date(journal.createdAt).getTime(),
            updatedAt: new Date(journal.updatedAt).getTime(),
            nonTitleUpdatedAt: new Date(journal.nonTitleUpdatedAt).getTime(),
        });
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const renameJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const { name: title } = req.body;
        const journal = await Journal.findById(id);
        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        if (journal.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        journal.title = title;
        await journal.save();
        await Version.create({
            journalId: journal._id,
            userId: req.user.userId,
            content: journal.content,
            title: journal.title,
        });
        res.status(200).json({ message: "Journal renamed successfully", journal });
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}

export const deleteJournal = async (req, res) => {
    try {
        const { id } = req.params;
        const journal = await Journal.findById(id);
        if (!journal) {
            return res.status(404).json({ message: "Journal not found" });
        }
        if (journal.userId.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Access denied" });
        }
        await Journal.findByIdAndDelete(id);
        await Version.deleteMany({ journalId: id });
        await User.findByIdAndUpdate(req.user.userId, { $pull: { journalIds: id } });
        res.status(200).json({ message: "Journal deleted successfully" });
    } catch (error) {
        console.log("error: ", error);
        res.status(500).json({ message: error.message });
    }
}