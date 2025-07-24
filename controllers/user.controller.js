import User from "../models/user.model.js";
import { getAuth, clerkClient } from "@clerk/express";

export const syncUser = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        // Check if user already exists
        let user = await User.findOne({ clerkId: userId });
        if (user) {
            req.user = {
                ...user.toObject(),
                userId: user._id.toString()
            };
            return next(); // User exists, proceed to next middleware
        }

        const clerkUser = await clerkClient.users.getUser(userId);
        console.log("Clerk user data:", clerkUser);
        console.log(clerkUser.emailAddresses[0]);
        const { firstName, lastName, imageUrl, username } = clerkUser;
        const email = clerkUser.emailAddresses[0]?.emailAddress;

        console.log({
            firstName,
            lastName,
            username,
            email,
            userId,
            imageUrl,
        })

        // Create new user
        user = new User({
            firstName: firstName || '',
            lastName: lastName || '',
            username: username || '',
            email: email || '',
            clerkId: userId,
            avatarUrl: imageUrl || ''
        });
        await user.save();
        req.user = {
            ...user.toObject(),
            userId: user._id.toString()
        }
        return next(); // Proceed to next middleware
    } catch (error) {
        res.status(500).json({ message: error.message });
        next();
    }
}