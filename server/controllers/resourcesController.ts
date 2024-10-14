import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Request, Response } from 'express';
import { ServerResponse } from '../models/ServerResponse.js';
import HttpService from '../models/HttpService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const svgBasePath = path.join(__dirname, '../../../front/media/'); // Base directory for your SVG files


export const getSVG = async (req: Request, res: Response): Promise<void> => {
  try {
    const parameters = HttpService.createResponseObject(req);
    if (parameters && parameters.path) {
      const svgPath = path.join(svgBasePath, parameters.path);
      const svg = fs.readFileSync(svgPath, 'utf8');
      const response = new ServerResponse('SVG fetched successfully', 'info', 200, svg.replace(/\n/g, ''), null);
      res.status(200).json(response);
    } else {
      throw new Error('Failed to fetch SVG');
    }
  } catch (error) {
    const response = new ServerResponse('Failed to load resource', 'error', 500, null, error);
    res.status(500).json(response);
  }
};
