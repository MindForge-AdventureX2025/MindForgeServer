import mongoose from "mongoose";

const versionSchema = new mongoose.Schema({
    journalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Journal',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    tags:[{
        type: String,
        required: false,
    }],
    audioIds: [{
        type: String,
        required: false,
    }],
}, {
    timestamps: true,
});

const Version = mongoose.model("Version", versionSchema);

export default Version;