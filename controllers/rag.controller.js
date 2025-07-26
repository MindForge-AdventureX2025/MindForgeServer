import Rag from "../models/rag.model.js";
import User from "../models/user.model.js";

// Create a new memory entry
export const createMemory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { 
            memoryType, 
            title, 
            content, 
            metadata = {}, 
            tags = [], 
            relatedMemories = [] 
        } = req.body;

        // Validate memoryType
        const validMemoryTypes = ['user_preferences', 'behavioral_patterns', 'emotional_patterns', 'topics_of_interest', 'goals_and_aspirations', 'personal_insights', 'conversation_context'];
        if (!validMemoryTypes.includes(memoryType)) {
            return res.status(400).json({ message: "Invalid memory type" });
        }

        const memory = new Rag({
            userId,
            memoryType,
            title,
            content,
            metadata: {
                sourceType: metadata.sourceType || 'user_input',
                sourceId: metadata.sourceId || null,
                confidence: metadata.confidence || 0.8,
                relevanceScore: metadata.relevanceScore || 0.5,
                lastAccessedAt: new Date(),
                accessCount: 0
            },
            tags,
            relatedMemories
        });

        await memory.save();

        res.status(201).json({
            ...memory.toObject(),
            createdAt: new Date(memory.createdAt).getTime(),
            updatedAt: new Date(memory.updatedAt).getTime()
        });
    } catch (error) {
        console.log("Error creating memory:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get all memories for a user
export const getUserMemories = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { 
            memoryType, 
            limit = 50, 
            page = 1, 
            sortBy = 'relevanceScore',
            tags,
            isActive = true
        } = req.query;

        const skip = (page - 1) * limit;
        let query = { userId };

        if (memoryType) query.memoryType = memoryType;
        if (tags) query.tags = { $in: tags.split(',') };
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const sortOptions = {};
        if (sortBy === 'relevanceScore') {
            sortOptions['metadata.relevanceScore'] = -1;
        } else if (sortBy === 'accessCount') {
            sortOptions['metadata.accessCount'] = -1;
        } else if (sortBy === 'lastAccessed') {
            sortOptions['metadata.lastAccessedAt'] = -1;
        } else {
            sortOptions.updatedAt = -1;
        }

        const memories = await Rag.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        if (!memories || memories.length === 0) {
            return res.status(404).json({ message: "No memories found" });
        }

        const formattedMemories = memories.map(memory => ({
            ...memory.toObject(),
            createdAt: new Date(memory.createdAt).getTime(),
            updatedAt: new Date(memory.updatedAt).getTime()
        }));

        res.status(200).json(formattedMemories);
    } catch (error) {
        console.log("Error getting memories:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get a specific memory by ID
export const getMemoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const memory = await Rag.findOne({ _id: id, userId });
        if (!memory) {
            return res.status(404).json({ message: "Memory not found" });
        }

        // Mark as accessed
        await memory.markAccessed();

        res.status(200).json({
            ...memory.toObject(),
            createdAt: new Date(memory.createdAt).getTime(),
            updatedAt: new Date(memory.updatedAt).getTime()
        });
    } catch (error) {
        console.log("Error getting memory:", error);
        res.status(500).json({ message: error.message });
    }
};

// Update a memory entry
export const updateMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData.userId;
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const memory = await Rag.findOneAndUpdate(
            { _id: id, userId },
            { 
                ...updateData,
                'metadata.lastAccessedAt': new Date()
            },
            { new: true }
        );

        if (!memory) {
            return res.status(404).json({ message: "Memory not found" });
        }

        res.status(200).json({
            ...memory.toObject(),
            createdAt: new Date(memory.createdAt).getTime(),
            updatedAt: new Date(memory.updatedAt).getTime()
        });
    } catch (error) {
        console.log("Error updating memory:", error);
        res.status(500).json({ message: error.message });
    }
};

// Search memories
export const searchMemories = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { 
            query, 
            memoryType, 
            tags, 
            limit = 20,
            minRelevance = 0.3
        } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        let searchQuery = {
            userId,
            isActive: true,
            'metadata.relevanceScore': { $gte: minRelevance }
        };

        if (memoryType) {
            searchQuery.memoryType = memoryType;
        }

        // Build search conditions
        const searchConditions = [
            { title: new RegExp(query, 'i') },
            { content: new RegExp(query, 'i') }
        ];

        // Add tag-based search if no specific tags filter is applied
        if (!tags) {
            // Search for query words in tags
            const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
            if (queryWords.length > 0) {
                searchConditions.push({ tags: { $in: queryWords } });
            }
        } else {
            // Use specific tags filter
            searchQuery.tags = { $in: tags.split(',').map(tag => tag.trim()) };
        }

        searchQuery.$or = searchConditions;

        const memories = await Rag.find(searchQuery)
            .sort({ 'metadata.relevanceScore': -1, 'metadata.lastAccessedAt': -1 })
            .limit(parseInt(limit));

        // Mark searched memories as accessed
        const accessPromises = memories.map(memory => memory.markAccessed());
        await Promise.all(accessPromises);

        const formattedMemories = memories.map(memory => ({
            ...memory.toObject(),
            createdAt: new Date(memory.createdAt).getTime(),
            updatedAt: new Date(memory.updatedAt).getTime()
        }));

        res.status(200).json(formattedMemories);
    } catch (error) {
        console.log("Error searching memories:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get memories by type
export const getMemoriesByType = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { type } = req.params;
        const { limit = 50, page = 1 } = req.query;

        const skip = (page - 1) * limit;

        const memories = await Rag.getMemoriesByType(userId, type, parseInt(limit))
            .skip(skip);

        if (!memories || memories.length === 0) {
            return res.status(404).json({ message: `No ${type} memories found` });
        }

        const formattedMemories = memories.map(memory => ({
            ...memory.toObject(),
            createdAt: new Date(memory.createdAt).getTime(),
            updatedAt: new Date(memory.updatedAt).getTime()
        }));

        res.status(200).json(formattedMemories);
    } catch (error) {
        console.log("Error getting memories by type:", error);
        res.status(500).json({ message: error.message });
    }
};

// Add tags to memory
export const addTagsToMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        const userId = req.user.userId;

        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: "Tags must be an array" });
        }

        const memory = await Rag.findOne({ _id: id, userId });
        if (!memory) {
            return res.status(404).json({ message: "Memory not found" });
        }

        // Add new tags (avoid duplicates)
        const newTags = tags.filter(tag => !memory.tags.includes(tag));
        memory.tags.push(...newTags);
        memory.metadata.lastAccessedAt = new Date();

        await memory.save();

        res.status(200).json({
            ...memory.toObject(),
            createdAt: new Date(memory.createdAt).getTime(),
            updatedAt: new Date(memory.updatedAt).getTime()
        });
    } catch (error) {
        console.log("Error adding tags to memory:", error);
        res.status(500).json({ message: error.message });
    }
};

// Remove tags from memory
export const removeTagsFromMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const { tags } = req.body;
        const userId = req.user.userId;

        if (!Array.isArray(tags)) {
            return res.status(400).json({ message: "Tags must be an array" });
        }

        const memory = await Rag.findOne({ _id: id, userId });
        if (!memory) {
            return res.status(404).json({ message: "Memory not found" });
        }

        memory.tags = memory.tags.filter(tag => !tags.includes(tag));
        memory.metadata.lastAccessedAt = new Date();

        await memory.save();

        res.status(200).json({
            ...memory.toObject(),
            createdAt: new Date(memory.createdAt).getTime(),
            updatedAt: new Date(memory.updatedAt).getTime()
        });
    } catch (error) {
        console.log("Error removing tags from memory:", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a memory (soft delete by setting isActive to false)
export const deleteMemory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const { permanent = false } = req.query;

        if (permanent === 'true') {
            // Permanent deletion
            const memory = await Rag.findOneAndDelete({ _id: id, userId });
            if (!memory) {
                return res.status(404).json({ message: "Memory not found" });
            }
            res.status(200).json({ message: "Memory permanently deleted" });
        } else {
            // Soft delete
            const memory = await Rag.findOneAndUpdate(
                { _id: id, userId },
                { isActive: false },
                { new: true }
            );
            if (!memory) {
                return res.status(404).json({ message: "Memory not found" });
            }
            res.status(200).json({ message: "Memory deactivated", memory });
        }
    } catch (error) {
        console.log("Error deleting memory:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get memory statistics for a user
export const getMemoryStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const stats = await Rag.aggregate([
            { $match: { userId: userId, isActive: true } },
            {
                $group: {
                    _id: '$memoryType',
                    count: { $sum: 1 },
                    avgRelevance: { $avg: '$metadata.relevanceScore' },
                    totalAccess: { $sum: '$metadata.accessCount' },
                    lastUpdated: { $max: '$updatedAt' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const totalMemories = await Rag.countDocuments({ userId, isActive: true });
        const totalTags = await Rag.distinct('tags', { userId, isActive: true });

        res.status(200).json({
            totalMemories,
            totalTags: totalTags.length,
            memoryTypeStats: stats,
            generatedAt: new Date().getTime()
        });
    } catch (error) {
        console.log("Error getting memory stats:", error);
        res.status(500).json({ message: error.message });
    }
};
