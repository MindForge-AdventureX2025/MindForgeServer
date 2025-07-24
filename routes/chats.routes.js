import express from "express";
import { createChat } from "../controllers/chat.controller";

const router = express.Router();

router.get("/:id", getChatById);
router.get("/history", getChatHistory);
router.post("/", createChat);
router.put("/:id", updateChat);

export default router;