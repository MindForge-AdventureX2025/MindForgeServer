import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        default: "New Chat",
    },
    messages: {
        type: [{
            sender: {
                type: String,
                enum: ['user', 'llm'],
                required: true,
            },
            content: {
                type: String,
                required: true,
            },
            journalId: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Journal',
            }],
            timestamp: {
                type: Date,
                default: Date.now,
            }
        }],
        required: false, // Messages can be empty initially
    },
}, {
    timestamps: true,
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
