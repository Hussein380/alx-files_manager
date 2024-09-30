// controllers/FilesController.js
import fileQueue from '../utils/fileQueue';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import FileModel from '../models/FileModel'; // Adjust the import as needed
import UserModel from '../models/UserModel'; // Ensure UserModel is imported
import redisClient from '../utils/redis'; // Assuming you're using Redis for authentication

class FilesController {
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

            // Add a job to the queue for generating thumbnails
            fileQueue.add({ userId, fileId: newFile._id });

            return res.status(201).json(newFile);
        }
    }
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
    const size = req.query.size;

    // Find the file linked to the user
    const file = await FileModel.findOne({ _id: fileId, userId });
    if (!file) return res.status(404).json({ error: 'Not found' });

    // If a size is provided, return the corresponding thumbnail
    if (size) {
        const thumbnailPath = path.join(path.dirname(file.localPath), `${path.basename(file.localPath, path.extname(file.localPath))}_${size}${path.extname(file.localPath)}`);
        
        // Check if the thumbnail file exists
        if (!fs.existsSync(thumbnailPath)) {
            return res.status(404).json({ error: 'Not found' });
        }
        return res.sendFile(thumbnailPath);
    }

    // Return the full file if no size is specified
    return res.sendFile(file.localPath);
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

    // GET /files/:id/data
    static async getFileData(req, res) {
        const fileId = req.params.id;
        const userId = req.user._id; // Get user ID from the authenticated request

        // Find the file by ID
        const file = await FileModel.findById(fileId);
        if (!file) return res.status(404).json({ error: 'Not found' });

        // Check visibility and ownership
        if (!file.isPublic && file.userId !== userId) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Check if the file is a folder
        if (file.type === 'folder') {
            return res.status(400).json({ error: "A folder doesn't have content" });
        }

        // Check if the file exists locally
        const filePath = path.join(process.env.FOLDER_PATH || '/tmp/files_manager', file.localPath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Not found' });
        }

        // Get the MIME type of the file
        const mimeType = mime.lookup(file.name) || 'application/octet-stream';
        res.setHeader('Content-Type', mimeType);

        // Stream the file content
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
}

export default FilesController;
