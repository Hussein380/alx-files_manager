// Import the MongoClient from the 'mongodb' library
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables from a .env file if available
dotenv.config();

class DBClient {
  constructor() {
    // Get MongoDB connection details from environment variables or set default values
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    // Construct the MongoDB URI
    const url = `mongodb://${host}:${port}`;
    
    // Create a new MongoClient instance
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    
    // Connect to MongoDB
    this.client.connect().then(() => {
      this.db = this.client.db(database); // Connect to the specified database
    }).catch((err) => {
      console.error('Failed to connect to MongoDB:', err); // Log connection errors
    });
  }

  // Method to check if MongoDB client is connected and alive
  isAlive() {
    return this.client && this.client.isConnected();
  }

  // Asynchronous method to count the number of documents in the 'users' collection
  async nbUsers() {
    try {
      return await this.db.collection('users').countDocuments();
    } catch (err) {
      console.error('Error counting users:', err);
      return 0; // Return 0 in case of an error
    }
  }

  // Asynchronous method to count the number of documents in the 'files' collection
  async nbFiles() {
    try {
      return await this.db.collection('files').countDocuments();
    } catch (err) {
      console.error('Error counting files:', err);
      return 0; // Return 0 in case of an error
    }
  }
}

// Create and export an instance of DBClient
const dbClient = new DBClient();
export default dbClient;
