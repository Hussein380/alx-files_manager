// controllers/FilesController.js

import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import FileModel from '../models/FileModel'; // Adjust the import as needed
import UserModel from '../models/UserModel'; // Ensure UserModel is imported
import redisClient from '../utils/redis'; // Assuming you're using Redis for authentication

class FilesController {
    // POST /files
    static async postUpload(req, res) {
        const { name, type, parentId = 0, isPublic = false, data } = req.body;
        const userId = req.user._id; // Get user ID from the authenticated request

        // Check for missing fields
        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!type || !['file', 'image', 'folder'].includes(type)) {
            return res.status(400).json({ error: 'Missing or invalid type' });
        }
        if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

        // Validate parentId if provided
        if (parentId) {
            const parentFile = await FileModel.findById(parentId);
            if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
            if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
        }

        // Create the file entry
        let localPath;
        if (type === 'folder') {
            const newFolder = new FileModel({ userId, name, type, isPublic, parentId });
            await newFolder.save();
            return res.status(201).json(newFolder);
        } else {
            // Generate a unique filename and determine the storage path
            const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            const filename = `${uuidv4()}`;
            localPath = path.join(folderPath, filename);

            // Write the file to the local filesystem
            const buffer = Buffer.from(data, 'base64');
            fs.writeFileSync(localPath, buffer);

            // Create a new file document in the database
            const newFile = new FileModel({
                userId,
                name,
                type,
                isPublic,
                parentId,
                localPath,
            });
            await newFile.save();

            return res.status(201).json(newFile);
        }
    }

    // GET /files/:id
    static async getShow(req, res) {
        const userId = req.user._id; // Get user ID from the authenticated request
        const fileId = req.params.id;

        // Find the file linked to the user
        const file = await FileModel.findOne({ _id: fileId, userId });
        if (!file) return res.status(404).json({ error: 'Not found' });

        return res.json(file);
    }

    // GET /files
    static async getIndex(req, res) {
        const userId = req.user._id; // Get user ID from the authenticated request
        const { parentId = 0, page = 0 } = req.query;

        // Calculate the pagination limit and skip
        const limit = 20;
        const skip = page * limit;

        // Retrieve files with pagination
        const files = await FileModel.find({ userId, parentId })
            .limit(limit)
            .skip(skip)
            .exec();

        return res.json(files);
    }

    // PUT /files/:id/publish
    static async putPublish(req, res) {
        const userId = req.user._id; // Get user ID from the authenticated request
        const fileId = req.params.id;

        // Find the file and update its visibility
        const file = await FileModel.findOneAndUpdate(
            { _id: fileId, userId },
            { isPublic: true },
            { new: true }
        );

        if (!file) return res.status(404).json({ error: 'Not found' });

        return res.json(file);
    }

    // PUT /files/:id/unpublish
    static async putUnpublish(req, res) {
        const userId = req.user._id; // Get user ID from the authenticated request
        const fileId = req.params.id;

        // Find the file and update its visibility
        const file = await FileModel.findOneAndUpdate(
            { _id: fileId, userId },
            { isPublic: false },
            { new: true }
        );

        if (!file) return res.status(404).json({ error: 'Not found' });

        return res.json(file);
    }
}

export default FilesController;
