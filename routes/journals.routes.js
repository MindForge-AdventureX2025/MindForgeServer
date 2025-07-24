import express from "express";
import { createJournal } from "../controllers/journals.controller.js";

const router = express.Router();

// router.get("/", getJournals);
router.post("/", createJournal);
// router.get("/:id", getJournalById);
// router.put("/:id", updateJournal);
// router.delete("/:id", deleteJournal);

// router.get("/search", searchJournals);

export default router;