import express from 'express';
import { getProjects, addProject } from '../controllers/projectController.js';

const router = express.Router();

// Define project-related routes
router.get('/', getProjects); // Route to get all projects
router.post('/', addProject); // Route to add a new project

export default router;
