// importing the Card class.
import { Card } from './Card.js';
import { IServerResponse } from '../../server/models/IServerResponse.js';
import { ServerResponse } from '../../server/models/ServerResponse.js';
import { IProjectConfig } from '../../server/config/ConfigInterfaces.js';
import HttpService from '../../server/models/HttpService.js';

class FrontApp {
  private projects: IProjectConfig[] = [];
  private selectedProject: IProjectConfig | null = null;
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeDOM();
      this.fetchProjects();
      // this.fetchCommits("");
    });
  }

  // Method to initialize the DOM
  private initializeDOM(): void {
    // const stackContainer = document.getElementById('stack-container');
    // console.log(stackContainer);
    // if (stackContainer) {
    //   this.renderCards(stackContainer);
    // }
  }

  // // Method to render cards in the stack container
  // private renderCards(stackContainer: HTMLElement): void {
  //   // Example code to create cards using fetched commits
  //   fetch('/api/commits')
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.all) {
  //         data.all.forEach((commit: any) => {
  //           const card = new Card(commit.message);
  //           card.addHoverEffect();
  //           stackContainer.appendChild(card.getElement());
  //         });
  //       }
  //     })
  //     .catch((error) => console.error('Error fetching commits:', error));
  // }

  // Method to fetch projects and render them
  // private fetchProjects(): void {
  //   fetch('/api/projects')
  //     .then((response) => response.json())
  //     .then((dResponse: IServerResponse) => {
  //       const response = new ServerResponse(dResponse);
  //       console.log(response);
  //       if (response.isError()) {
  //         console.error(response.message);
  //         return;
  //       }
  //       this.projects = response.data ?? [];
  //       this.renderProjects(response.data ?? []);
  //     })
  //     .catch((error) => console.error('Unexpected error:', error));
  // }


  // Method to render the projects list
  private renderProjects(projects: IProjectConfig[]): void {
    const projectsUl = document.getElementById('projects-list');
    if (projectsUl) {
      projects.forEach((project) => {
        const projectLi = document.createElement('li');
        projectLi.textContent = project.name;
        projectLi.classList.add('project');
        projectLi.classList.remove('selected');
        projectLi.addEventListener('click', () => {
          projectLi.classList.add('selected');
          console.log('Selected project:', project);
          this.selectedProject = project;
          // this.fetchProjects();
          this.fetchCommits(this.selectedProject.path);
        });
        projectsUl.appendChild(projectLi);
      });
    } else {
      console.error('Projects list not found');
    }
  }

  private async fetchProjects(): Promise<void> {
    try {
      const data = await HttpService.Fetch < IServerResponse < IProjectConfig[] >> ('/api/projects');
      const response = new ServerResponse(data);
      if (response.isError()) {
        console.error(response.message);
        return;
      }
      this.projects = response.data ?? [];
      this.renderProjects(response.data ?? []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }
  private async fetchCommits(projectPath: string, branch: string = ""): Promise<void> {
    try {
      const data = await HttpService.Fetch < IServerResponse < string[] >> ('/api/git/commits', { path: projectPath, branch: branch });
      const response = new ServerResponse(data);
      if (response.isError()) {
        console.error(response.message);
        return;
      }
      console.log(response.data.map((commit: any) => commit.message));
      // this.renderCommits(response.data?.commits ?? []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }
}
new FrontApp();
