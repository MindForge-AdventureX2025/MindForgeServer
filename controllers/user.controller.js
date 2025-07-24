import User from "../models/user.model";
import { getAuth, clerkClient } from "@clerk/express";

export const syncUser = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);
        const clerkUser = await clerkClient.users.getUser(userId);
        console.log("Clerk user data:", clerkUser);
        const { firstname, lastname, email } = clerkUser;

        // Check if user already exists
        let user = await User.findOne({ clerkId: userId });
        if (user) {
            next(); // User exists, proceed to next middleware
        }

        // Create new user
        user = new User({ firstname, lastname, email, clerkId: userId });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}