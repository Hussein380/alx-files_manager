// Import the redis module
import { createClient } from 'redis';

// Define a class RedisClient that interacts with Redis
class RedisClient {
  constructor() {
    // Create a Redis client
    this.client = createClient();

    // Error handling: Log any errors that occur when connecting to Redis
    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    // Connect to the Redis server
    this.client.connect().catch((err) => {
      console.error('Could not connect to Redis:', err);
    });
  }

  // Method to check if the Redis client is connected and alive
  isAlive() {
    // Return true if the client is connected, false otherwise
    return this.client.isOpen;
  }

  // Asynchronous method to get a value by key from Redis
  async get(key) {
    try {
      // Return the value for the given key
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  // Asynchronous method to set a key with a value and expiration time (in seconds)
  async set(key, value, duration) {
    try {
      // Set the key with the value and set the expiration time
      await this.client.set(key, value);
      await this.client.expire(key, duration); // Set the expiration in seconds
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
    }
  }

  // Asynchronous method to delete a key from Redis
  async del(key) {
    try {
      // Delete the key from Redis
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
    }
  }
}

// Export an instance of RedisClient to be used in other files
const redisClient = new RedisClient();
export default redisClient;
