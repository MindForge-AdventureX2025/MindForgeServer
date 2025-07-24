import User from "../models/user.model";

export const syncUser = async (req, res) => {
    try {
        const { firstname, lastname, email, clerkId } = req.body;

        // Check if user already exists
        let user = await User.findOne({ clerkId });
        if (user) {
            // Update existing user
            user.firstname = firstname;
            user.lastname = lastname;
            user.email = email;
            await user.save();
            return res.status(200).json(user);
        }

        // Create new user
        user = new User({ firstname, lastname, email, clerkId });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}