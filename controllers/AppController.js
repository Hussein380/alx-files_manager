// controllers/AppController.js
import dbClient from '../utils/db.js'; // Import DBClient instance
import redisClient from '../utils/redis.js'; // Import Redis client instance (make sure to create this)

// Create the AppController
class AppController {
    static async getStatus(req, res) {
        const status = {
            redis: redisClient.isAlive(), // Check if Redis is alive
            db: dbClient.isAlive(), // Check if DB is alive
        };
        return res.status(200).json(status); // Respond with status
    }

    static async getStats(req, res) {
        const usersCount = await dbClient.nbUsers(); // Get user count
        const filesCount = await dbClient.nbFiles(); // Get file count
        return res.status(200).json({ users: usersCount, files: filesCount }); // Respond with stats
    }
}

export default AppController;
