import projectRoutes from './routes/projectRoutes.js';
import gitRoutes from './routes/gitRoutes.js';
import express, { Application } from 'express';

class Main {
  public app: Application;
  private port: number = 3000;

  constructor(port: number) {
    this.app = express(); // Initialize the Express application
    this.port = port;

    this.initializeMiddlewares(); // Initialize middlewares
    this.initializeRoutes(); // Initialize routes
  }

  // Method to initialize middlewares
  private initializeMiddlewares(): void {
    this.app.use(express.json()); // Parse JSON request bodies
    this.app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
    this.app.use(express.static('public')); // Serve static files from 'public' directory
  }

  // Method to initialize routes
  private initializeRoutes(): void {
    // Use modularized routes
    this.app.use('/api/projects', projectRoutes);
    console.log('projectRoutes', projectRoutes);
    this.app.use('/api/git', gitRoutes);
    console.log('gitRoutes', gitRoutes);
  }

  // Method to start the server
  public start(): void {
    const server = this.app.listen(this.port, () => {
      console.log(`Server is running at http://localhost:${this.port}`);
    });
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing server...');
      server.close(() => {
        console.log('Server closed.');
      });
    });
  }
}

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const mainApp = new Main(PORT);
mainApp.start();
