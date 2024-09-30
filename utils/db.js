// utils/db.js
import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        // Set MongoDB connection parameters from environment variables or default values
        const host = process.env.DB_HOST || 'localhost'; // Default host
        const port = process.env.DB_PORT || '27017'; // Default port
        const database = process.env.DB_DATABASE || 'files_manager'; // Default database name

        // Construct the MongoDB connection string
        const uri = `mongodb://${host}:${port}/${database}`;
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        
        // Connect to MongoDB and handle connection errors
        this.client.connect()
            .then(() => console.log('Connected to MongoDB'))
            .catch((error) => {
                console.error('MongoDB connection error:', error);
                // You can throw the error here if you want it to propagate
            });
    }

    // Method to check if the connection is alive
    isAlive() {
        return this.client.topology && this.client.topology.isConnected(); // Check connection status
    }

    // Asynchronous method to get the number of users
    async nbUsers() {
        try {
            const db = this.client.db(); // Access the database
            const usersCollection = db.collection('users'); // Reference the users collection
            return await usersCollection.countDocuments(); // Count and return documents
        } catch (error) {
            console.error('Error counting users:', error);
            throw error; // Re-throw the error for handling in the calling code
        }
    }

    // Asynchronous method to get the number of files
    async nbFiles() {
        try {
            const db = this.client.db(); // Access the database
            const filesCollection = db.collection('files'); // Reference the files collection
            return await filesCollection.countDocuments(); // Count and return documents
        } catch (error) {
            console.error('Error counting files:', error);
            throw error; // Re-throw the error for handling in the calling code
        }
    }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
