import { Request, Response } from 'express';
import ConfigManager from '../config/ConfigManager.js';
import { ServerResponse } from '../models/ServerResponse.js';

const configManager = new ConfigManager();

// Get all projects
export const getProjects = (req: Request, res: Response): void => {
  const config = configManager.loadConfig();
  if (config) {
    const response = new ServerResponse('List of projects loaded successfully', 'info', 200, config.projects);
    res.status(200).json(response);
  } else {
    const response = new ServerResponse('Failed to load projects', 'error', 500);
    res.status(500).json(response);
  }
};

// Add a new project
export const addProject = (req: Request, res: Response): void => {
  try {
    const project = req.body;
    configManager.upsertProject(project);
    const response = new ServerResponse('Project added successfully', 'info', 200, project);
    res.status(200).json(response);
  }
  catch (error) {
    const response = new ServerResponse('Failed to add project', 'error', 500, null, error);
    res.status(500).json(response);
  }
};
