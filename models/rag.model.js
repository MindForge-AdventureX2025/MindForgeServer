import mongoose from "mongoose";

const ragSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    memoryType: {
        type: String,
        enum: ['user_preferences', 'behavioral_patterns', 'emotional_patterns', 'topics_of_interest', 'goals_and_aspirations', 'personal_insights', 'conversation_context'],
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    metadata: {
        sourceType: {
            type: String,
            enum: ['journal', 'chat', 'agent_analysis', 'user_input', 'api_test'],
            required: true
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: false // Optional reference to source document
        },
        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.8
        },
        relevanceScore: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.5
        },
        lastAccessedAt: {
            type: Date,
            default: Date.now
        },
        accessCount: {
            type: Number,
            default: 0
        }
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    embeddings: {
        vector: [Number], // For future AI embeddings integration
        model: {
            type: String,
            default: 'text-embedding-ada-002'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        required: false // Optional expiration for temporary memories
    },
    relatedMemories: [{
        memoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Rag'
        },
        relationshipType: {
            type: String,
            enum: ['similar', 'contradictory', 'supportive', 'temporal', 'causal']
        },
        strength: {
            type: Number,
            min: 0,
            max: 1,
            default: 0.5
        }
    }]
}, {
    timestamps: true
});

// Indexes for efficient querying
ragSchema.index({ userId: 1, memoryType: 1 });
ragSchema.index({ userId: 1, tags: 1 });
ragSchema.index({ userId: 1, 'metadata.sourceType': 1 });
ragSchema.index({ userId: 1, 'metadata.lastAccessedAt': -1 });
ragSchema.index({ userId: 1, 'metadata.relevanceScore': -1 });
ragSchema.index({ content: 'text', title: 'text' }); // Text search index

// Middleware to update lastAccessedAt and increment accessCount
ragSchema.methods.markAccessed = function() {
    this.metadata.lastAccessedAt = new Date();
    this.metadata.accessCount += 1;
    return this.save();
};

// Static method to find relevant memories
ragSchema.statics.findRelevantMemories = function(userId, query, limit = 10) {
    return this.find({
        userId,
        isActive: true,
        $or: [
            { title: new RegExp(query, 'i') },
            { content: new RegExp(query, 'i') },
            { tags: { $in: query.toLowerCase().split(' ') } }
        ]
    })
    .sort({ 'metadata.relevanceScore': -1, 'metadata.lastAccessedAt': -1 })
    .limit(limit);
};

// Static method to get memories by type
ragSchema.statics.getMemoriesByType = function(userId, memoryType, limit = 50) {
    return this.find({
        userId,
        memoryType,
        isActive: true
    })
    .sort({ 'metadata.relevanceScore': -1, updatedAt: -1 })
    .limit(limit);
};

const Rag = mongoose.model("Rag", ragSchema);
export default Rag;
