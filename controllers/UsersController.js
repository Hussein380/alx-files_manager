import redisClient from '../utils/redis';  // Import Redis client
import User from '../models/User';  // Import User model
import crypto from 'crypto';  // For hashing passwords

class UsersController {
    // Endpoint to create a new user (postNew)
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

    // New endpoint to get user information based on the token (getMe)
    static async getMe(req, res) {
        const token = req.headers['x-token'];

        // Check if token is provided
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Retrieve user ID from Redis using the token
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);

        // If the token is not found or expired
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Find the user by ID and return their email and ID
        const user = await User.findById(userId).select('email _id');
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Return user information
        return res.status(200).json(user);
    }
}

export default UsersController;
