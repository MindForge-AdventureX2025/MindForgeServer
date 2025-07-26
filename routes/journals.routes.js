import express from "express";
import { addTags, createJournal, deleteJournal, getJournalHistory, getJournalById, getJournalVersions, removeTags, renameJournal, searchJournals, setVersionById, updateJournal } from "../controllers/journals.controller.js";
import { rename } from "fs";

const router = express.Router();

router.get("/", getJournalHistory);
router.post("/", createJournal);
router.get("/:id", getJournalById);
router.put("/:id", updateJournal);
router.post("/tags", addTags);
router.delete("/tags", removeTags);
router.get("/search", searchJournals); // Assuming you have a searchJournals function
router.get("/versions/:id", getJournalVersions); // Assuming you have a getJournalVersions function
router.post("/rename/:id", renameJournal); // Assuming you have a renameJournal function
router.delete("/delete/:id", deleteJournal); // Assuming you have a deleteJournal function
router.post("/versions/:id", setVersionById); // Assuming you have a setVersionById function

export default router;