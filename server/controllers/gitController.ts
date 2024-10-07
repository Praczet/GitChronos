import { Request, Response } from 'express';
import SimpleGit from 'simple-git';
import { ServerResponse } from '../models/ServerResponse.js';

// Example: Get commit history (dummy data)
export const getCommitHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const gitLog = await SimpleGit().log();
    const response = new ServerResponse('Commit history fetched successfully', 'info', 200, gitLog.all);
    res.status(200).json(response);
  } catch (error) {
    const response = new ServerResponse('Failed to fetch commit history', 'error', 500, null, error);
    res.status(500).json(response);
  }
};

// Get details of a specific commit
// export const getCommitDetails = (req: Request, res: Response): void => {
//   const commitId = req.params.commitId;
//   // Replace this with actual logic to get details of the commit
//   res.json({ id: commitId, message: 'Detailed info about the commit' });
// };
