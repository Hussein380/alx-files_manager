// worker.js

import Bull from 'bull';
import FileModel from './models/FileModel'; // Adjust the path as necessary
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job) => {
    const { userId, fileId } = job.data;

    // Validate job data
    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    // Find the file in the database
    const file = await FileModel.findOne({ _id: fileId, userId });
    if (!file) throw new Error('File not found');

    // Generate thumbnails
    const sizes = [500, 250, 100];
    const thumbnailPromises = sizes.map(async (size) => {
        const thumbnailPath = path.join(path.dirname(file.localPath), `${path.basename(file.localPath, path.extname(file.localPath))}_${size}${path.extname(file.localPath)}`);
        const options = { width: size };

        // Generate and save the thumbnail
        try {
            const thumbnail = await imageThumbnail(file.localPath, options);
            fs.writeFileSync(thumbnailPath, thumbnail);
        } catch (error) {
            console.error(`Error generating thumbnail for ${size}px:`, error);
        }
    });

    await Promise.all(thumbnailPromises);
});

export default fileQueue;
