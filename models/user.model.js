import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true,
    },
    last_name:{
        type: String,
        required: true,
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