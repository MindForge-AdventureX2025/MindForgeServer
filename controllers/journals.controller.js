import User from "../models/user.model.js";
import Journal from "../models/journal.model.js";
import { getAuth } from "@clerk/express";

export const createJournal = async (req, res) => {
    try {
        console.log("Creating journal with body:", req.body);
        const { userId } = getAuth(req);
        console.log("Authenticated user ID:", userId);
        res.send("Journal creation endpoint hit");
        // const { title, content, userId } = req.body;
        // const newJournal = new Journal({ title, content, userId });
        // await newJournal.save();

        // Update user's journalIds
        await User.findByIdAndUpdate(userId, { $push: { journalIds: newJournal._id } });

        res.status(201).json(newJournal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}