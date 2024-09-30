import redisClient from '../utils/redis'; // Redis client
import User from '../models/User'; // User model
import { v4 as uuidv4 } from 'uuid'; // To generate unique tokens
import sha1 from 'sha1'; // For password hashing
import base64 from 'base-64'; // For decoding Basic Auth header

class AuthController {
    static async getConnect(req, res) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Decode Base64 email:password
        const credentials = base64.decode(authHeader.split(' ')[1]);
        const [email, password] = credentials.split(':');

        // Find user by email and verify hashed password
        const user = await User.findOne({ email, password: sha1(password) });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Generate a token and store it in Redis
        const token = uuidv4();
        const key = `auth_${token}`;
        await redisClient.set(key, user._id.toString(), 'EX', 24 * 3600); // 24 hours expiration

        // Return the token
        return res.status(200).json({ token });
    }

    static async getDisconnect(req, res) {
        const token = req.headers['x-token'];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Remove the token from Redis
        const key = `auth_${token}`;
        const userId = await redisClient.get(key);

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        await redisClient.del(key); // Delete the token
        return res.status(204).send(); // No content
    }
}

export default AuthController;
