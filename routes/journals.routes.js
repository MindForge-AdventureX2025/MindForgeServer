import express from "express";
import { addTags, createJournal, deleteJournal, getJournals, removeTags, searchJournals, updateJournal } from "../controllers/journals.controller.js";

const router = express.Router();

router.get("/", getJournals);
router.post("/", createJournal);
router.get("/:id", getJournals);
router.put("/:id", updateJournal);
router.delete("/:id", deleteJournal);
router.post("/tags", addTags);
router.delete("/tags", removeTags);
router.get("/search", searchJournals); // Assuming you have a searchJournals function

export default router;