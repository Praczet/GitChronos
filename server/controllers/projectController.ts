
import { Request, Response } from 'express';
import ConfigManager from '../config/ConfigManager.js';

const configManager = new ConfigManager();

// Get all projects
export const getProjects = (req: Request, res: Response): void => {
  const config = configManager.loadConfig();
  if (config) {
    res.json(config.projects);
  } else {
    res.status(500).send('Error loading projects');
  }
};

// Add a new project
export const addProject = (req: Request, res: Response): void => {
  const project = req.body;
  configManager.upsertProject(project);
  res.send('Project added successfully');
};
