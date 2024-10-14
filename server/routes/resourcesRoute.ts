import express from 'express';
import { getSVG } from '../controllers/resourcesController.js';

const router = express.Router();

// Define project-related routes
router.get('/getSVG', getSVG); // Route to get all projects
// router.post('/', addProject); // Route to add a new project

export default router;
