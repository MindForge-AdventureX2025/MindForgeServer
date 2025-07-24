import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    messages: [{
        sender: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        journalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Journal',
        },
        timestamp: {
            type: Date,
            default: Date.now,
        }
    }],
}, {
    timestamps: true,
});

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
