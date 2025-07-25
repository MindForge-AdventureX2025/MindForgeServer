import mongoose from "mongoose";

const journalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tags: [
        {
            type: String,
            required: false,
        }
    ],
    audioIds: [{
        type: String,
        required: false,
    }],
    nonTitleUpdatedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true,
});

const Journal = mongoose.model("Journal", journalSchema);
export default Journal;
