
import express from 'express';
import { getCommitHistory, getCommitDetails } from '../controllers/commitController.js';

const router = express.Router();

// Define commit-related routes
router.get('/history', getCommitHistory); // Route to get commit history
router.get('/:commitId', getCommitDetails); // Route to get details of a specific commit

export default router;
