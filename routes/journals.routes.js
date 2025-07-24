import express from "express";

const router = express.Router();

router.get("/", getJournals);
router.post("/", createJournal);
router.get("/:id", getJournalById);
router.put("/:id", updateJournal);
router.delete("/:id", deleteJournal);

router.get("/search", searchJournals);

export default router;