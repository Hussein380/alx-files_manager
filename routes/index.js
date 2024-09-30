// routes/index.js
import { Router } from 'express';
import AppController from '../controllers/AppController.js';
import UsersController from '../controllers/UsersController.js';
const express = require('express');
const router = express.Router();
const FilesController = require('../controllers/FilesController');

const router = Router();

// Define API endpoints
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/username', UserController.getMe);

router.post('/files', FilesController.postUpload);  
// Get file by ID
router.get('/files/:id', FilesController.getShow);
// Get all files  by ID
router.get('/files', FilesController.getIndex);

export default router;
