
import express from 'express';
// import { getCommitHistory, getCommitDetails } from '../controllers/gitController.js';
import { getCommitHistory } from '../controllers/gitController.js';

const router = express.Router();

// Define commit-related routes
router.get('/commits', getCommitHistory); // Route to get commit history
// router.get('/', getCommitDetails); // Route to get details of a specific commit

export default router;
