import express from "express";
import { createChat, getChatById, getChatHistory, updateChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:id", getChatById);
router.get("/", getChatHistory);
router.post("/", createChat);
router.put("/:id", updateChat);

export default router;