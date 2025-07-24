import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName:{
        type: String,
        required: false,
    },
    lastName:{
        type: String,
        required: false,
    },
    username:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true,
    },
    clerkId:{
        type: String,
        required: true,
        unique: true,
    },
    avatarUrl:{
        type: String,
        required: false
    },
    journalIds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Journal'
    }],
    chatIds:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
},
{
    timestamps: true,
})

const User = mongoose.model("User", userSchema);
export default User;