import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { IConfig, IProjectConfig } from './ConfigInterfaces.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  private configFilePath: string;

  constructor() {
    console.warn('dirname', __dirname);
    this.configFilePath = path.join(__dirname, 'config.json');
  }

  // Load configuration from file
  public loadConfig(): IConfig | null {
    if (fs.existsSync(this.configFilePath)) {
      try {
        const data = fs.readFileSync(this.configFilePath, 'utf8');
        return JSON.parse(data); // Parse the JSON content of the file
      } catch (error) {
        console.error('Error reading or parsing the config file:', error);
        return null;
      }
    } else {
      console.warn('Config file does not exist:', this.configFilePath);
      return null;
    }
  }

  // Save configuration to file
  public saveConfig(config: IConfig): void {
    try {
      fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
      console.log('Configuration saved successfully.');
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }

  // Add or update a project configuration
  public upsertProject(project: IProjectConfig): void {
    const config = this.loadConfig() || { projects: [], globalSettings: { theme: 'light' } };

    const existingProjectIndex = config.projects.findIndex(p => p.path === project.path);
    if (existingProjectIndex !== -1) {
      // Update existing project
      config.projects[existingProjectIndex] = { ...config.projects[existingProjectIndex], ...project };
    } else {
      // Add new project
      config.projects.push(project);
    }

    this.saveConfig(config);
  }

  // Update global settings
  public updateGlobalSettings(theme: 'dark' | 'light'): void {
    const config = this.loadConfig() || { projects: [], globalSettings: { theme: 'light' } };
    config.globalSettings.theme = theme;
    this.saveConfig(config);
  }
}

export default ConfigManager;
