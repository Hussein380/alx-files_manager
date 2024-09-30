// controllers/UsersController.js
import crypto from 'crypto'; // Import crypto for hashing
import User from '../models/User.js'; // Import your User model

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        // Check for missing email
        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }

        // Check for missing password
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Already exist' });
        }

        // Hash the password using SHA1
        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

        // Create a new user instance
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();

        // Return the new user's id and email
        return res.status(201).json({
            id: newUser._id,
            email: newUser.email,
        });
    }
}

export default UsersController;
