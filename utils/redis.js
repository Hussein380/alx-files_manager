// Import the redis module to create a Redis client
import { createClient } from 'redis';

// Define a class RedisClient that will manage interactions with Redis
class RedisClient {
  constructor() {
    // Create a Redis client instance
    this.client = createClient();

    // Handle Redis connection errors
    this.client.on('error', (error) => {
      console.error('Redis client error:', error);
    });

    // Connect the client to the Redis server
    this.client.connect().catch((err) => {
      console.error('Could not connect to Redis:', err);
    });
  }

  // Method to check if the Redis client is connected and ready
  isAlive() {
    return this.client.isOpen;
  }

  // Asynchronous method to retrieve the value of a specific key from Redis
  async get(key) {
    try {
      // Return the value associated with the key
      const value = await this.client.get(key);
      return value;
    } catch (error) {
      console.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  // Asynchronous method to store a key-value pair in Redis with an optional expiration time
  async set(key, value, duration) {
    try {
      // Store the key-value pair in Redis
      await this.client.set(key, value);
      // If a duration is specified, set the expiration time in seconds
      if (duration) {
        await this.client.expire(key, duration);
      }
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
    }
  }

  // Asynchronous method to delete a key from Redis
  async del(key) {
    try {
      // Remove the key from Redis
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
    }
  }
}

// Export an instance of the RedisClient class to be used throughout the project
const redisClient = new RedisClient();
export default redisClient;
