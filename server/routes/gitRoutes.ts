import express from 'express';
import { getCommits } from '../controllers/gitController.js';

const router = express.Router();

// Define project-related routes
router.get('/commits', getCommits); // Route to get all projects
// router.post('/', addProject); // Route to add a new project

export default router;
