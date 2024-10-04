import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface ProjectConfig {
  name: string;
  path: string;
  theme?: 'dark' | 'light';
  lastView?: {
    type: 'timeline' | 'file';
    data: any;
  };
}

interface Config {
  projects: ProjectConfig[];
  globalSettings: {
    theme: 'dark' | 'light';
  };
}
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  private configFilePath: string;

  constructor() {
    this.configFilePath = path.join(__dirname, 'config.json');
  }

  // Load configuration from file
  public loadConfig(): Config | null {
    try {
      const data = fs.readFileSync(this.configFilePath, 'utf8');
      return JSON.parse(data) as Config;
    } catch (error) {
      console.error('Error loading configuration:', error);
      return null;
    }
  }

  // Save configuration to file
  public saveConfig(config: Config): void {
    try {
      fs.writeFileSync(this.configFilePath, JSON.stringify(config, null, 2));
      console.log('Configuration saved successfully.');
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }

  // Add or update a project configuration
  public upsertProject(project: ProjectConfig): void {
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
