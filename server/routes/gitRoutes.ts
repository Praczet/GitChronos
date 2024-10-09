import express from 'express';
import { getCommits, getBranches, getLogGraph, getCommit } from '../controllers/gitController.js';

const router = express.Router();

// Define project-related routes
router.get('/commits', getCommits); // Route to get all projects
router.get('/commit', getCommit); // Route to get all projects
router.post('/commit', getCommit); // Route to get all projects
router.get('/branches', getBranches); // Route to get all projects
router.get('/graph', getLogGraph); // Route to get all projects
// router.post('/', addProject); // Route to add a new project

export default router;
