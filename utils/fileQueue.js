// utils/fileQueue.js

import Bull from 'bull';
import worker from '../worker'; // Import the worker to process the queue

const fileQueue = new Bull('fileQueue', {
    redis: {
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: process.env.REDIS_PORT || 6379,
    },
});

// Process the queue with the worker
fileQueue.process(worker);

export default fileQueue;
