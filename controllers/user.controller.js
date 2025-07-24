import User from "../models/user.model.js";
import { getAuth, clerkClient } from "@clerk/express";

export const syncUser = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        // Check if user already exists
        let user = await User.findOne({ clerkId: userId });
        if (user) {
            return next(); // User exists, proceed to next middleware
        }

        const clerkUser = await clerkClient.users.getUser(userId);
        console.log("Clerk user data:", clerkUser);
        console.log(clerkUser.email_addresses[0]);
        console.log(clerkUser.emailAddresses[0]);
        const { firstName, lastName, imageUrl } = clerkUser;
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        // Create new user
        user = new User({ firstName, lastName, email, clerkId: userId, avatarUrl: imageUrl });
        await user.save();
        req.user = {
            ...user,
            userId: user._id.toString()
        }
        return next(); // Proceed to next middleware
    } catch (error) {
        res.status(500).json({ message: error.message });
        next();
    }
}