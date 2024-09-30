import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import FileModel from '../models/FileModel'; // Adjust the import as needed
import UserModel from '../models/UserModel'; // Ensure UserModel is imported
import redisClient from '../utils/redis'; // Assuming you're using Redis for authentication

class FilesController {
  static async postUpload(req, res) {
    // Existing upload logic...
  }

  static async getShow(req, res) {
    // Retrieve user from the token
    const userId = await redisClient.get(req.headers['x-token']);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Find the file based on the ID and user ID
    const file = await FileModel.findOne({ id, userId });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    // Return the file document
    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    // Retrieve user from the token
    const userId = await redisClient.get(req.headers['x-token']);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { parentId = 0, page = 0 } = req.query;

    // Set pagination parameters
    const limit = 20; // Max items per page
    const skip = page * limit;

    // Find files based on parentId and userId with pagination
    const files = await FileModel.find({ parentId, userId })
      .skip(skip)
      .limit(limit)
      .exec();

    // Return the list of file documents
    return res.status(200).json(files);
  }
}

export default FilesController;
