import { Request, Response } from 'express';
import SimpleGit from 'simple-git';
import { ServerResponse } from '../models/ServerResponse.js';
import HttpService from '../models/HttpService.js';

export const getCommits = async (req: Request, res: Response): Promise<void> => {
  try {
    const parameters = HttpService.createResponseObject(req);
    console.log('Parameters:', parameters);
    const gitOptions = parameters && parameters.path ? parameters.path : undefined;
    const gitLog = await SimpleGit(gitOptions).log();
    const response = new ServerResponse('Commit history fetched successfully', 'info', 200, gitLog.all, parameters);
    res.status(200).json(response);
  } catch (error) {
    const response = new ServerResponse('Failed to fetch commit history', 'error', 500, null, error);
    res.status(500).json(response);
  }
};
