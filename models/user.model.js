import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true,
    },
    lastname:{
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