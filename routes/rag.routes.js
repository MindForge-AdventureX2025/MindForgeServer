import express from "express";
import { 
    createMemory, 
    getUserMemories, 
    getMemoryById, 
    updateMemory, 
    searchMemories, 
    getMemoriesByType,
    addTagsToMemory,
    removeTagsFromMemory,
    deleteMemory,
    getMemoryStats
} from "../controllers/rag.controller.js";

const router = express.Router();

// GET /api/rag - Get all memories for user
router.get("/", getUserMemories);

// POST /api/rag - Create new memory
router.post("/", createMemory);

// GET /api/rag/search - Search memories
router.get("/search", searchMemories);

// GET /api/rag/stats - Get memory statistics
router.get("/stats", getMemoryStats);

// GET /api/rag/type/:type - Get memories by type
router.get("/type/:type", getMemoriesByType);

// GET /api/rag/:id - Get specific memory by ID
router.get("/:id", getMemoryById);

// PUT /api/rag/:id - Update memory
router.put("/:id", updateMemory);

// POST /api/rag/:id/tags - Add tags to memory
router.post("/:id/tags", addTagsToMemory);

// DELETE /api/rag/:id/tags - Remove tags from memory
router.delete("/:id/tags", removeTagsFromMemory);

// DELETE /api/rag/:id - Delete memory (soft delete by default)
router.delete("/:id", deleteMemory);

export default router;
