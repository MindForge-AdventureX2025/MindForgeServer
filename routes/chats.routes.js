import express from "express";
import { createChat, deleteChat, getChatById, getChatHistory, updateChat, updateChatName } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/:id", getChatById);
router.get("/", getChatHistory);
router.post("/", createChat);
router.put("/:id", updateChat);
router.post("/rename/:id", updateChatName); // Assuming you have a deleteChat function
router.get("/delete/:id", deleteChat); // Assuming you have a deleteChat function

export default router;