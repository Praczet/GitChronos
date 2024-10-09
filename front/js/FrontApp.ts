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
    let counter = 1;
    if (projectsUl) {

      projects.forEach((project) => {
        project.uuid = counter++;
        const projectLi = document.createElement('li');
        projectLi.textContent = project.name;
        projectLi.id = project.uuid ? `project-${project.uuid}` : '';
        projectLi.classList.add('project');
        projectLi.classList.remove('selected');
        projectLi.addEventListener('click', () => {
          projectLi.classList.add('selected');
          console.log('Selected project:', project);
          this.selectedProject = project;
          // this.fetchProjects();
          // this.fetchBranches(this.selectedProject);
          this.fetchLogGraph(this.selectedProject);
          // this.fetchCommits(this.selectedProject.path);
        });
        projectsUl.appendChild(projectLi);
      });
    } else {
      console.error('Projects list not found');
    }
  }
  private renderBranches(branches: string[]): void {
    const branchesUl = document.getElementById('branches-list');
    if (branchesUl) {
      branches.forEach((branch) => {
        const branchLi = document.createElement('li');
        branchLi.textContent = branch;
        branchLi.classList.add('branch');
        branchLi.addEventListener('click', () => {
          console.log('Selected branch:', branch);
          this.fetchCommits(this.selectedProject?.path ?? "", branch);
        });
        branchesUl.appendChild(branchLi);
      });
    } else {
      console.error('Branches list not found');
    }
  }

  private async fetchProjects(): Promise<void> {
    try {
      const data = await HttpService.Fetch<IServerResponse<IProjectConfig[]>>('/api/projects');
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
      const data = await HttpService.Fetch<IServerResponse<Record<string, any>>>('/api/git/commits', { path: projectPath, branch: branch });
      const response = new ServerResponse(data);
      if (response.isError()) {
        console.error(response.message);
        return;
      }
      console.log(response.data);
      console.log(response.data.filter((commit: Record<string, any>) => commit.refs !== ""));
      // this.renderCommits(response.data?.commits ?? []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }
  private async fetchBranches(project: IProjectConfig): Promise<void> {
    try {
      const data = await HttpService.Fetch<IServerResponse<string[]>>('/api/git/branches', { path: project.path });
      const response = new ServerResponse(data);
      if (response.isError()) {
        console.error(response.message);
        return;
      }
      console.log(response.data);
      this.renderBranches(response.data ?? []);
      // this.renderBranches(response.data?.branches ?? []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }
  private async fetchLogGraph(project: IProjectConfig): Promise<void> {
    try {
      const data = await HttpService.Fetch<IServerResponse<string[]>>('/api/git/graph', { path: project.path });
      const response = new ServerResponse(data);
      if (response.isError()) {
        console.error(response.message);
        return;
      }
      this.renderGraph(response.data ?? []);
      console.log(response.data);
      // this.renderBranches(response.data?.branches ?? []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }

  /**
  * It will render the graph data
   *
  * @param {{ commit: string, parents: string[], refs: string }[]} graph - list of commits
   */
  private renderGraph(graph: { commit: string, parents: string[], refs: string }[]): void {
    const graphCanvas = document.getElementById('graph-canvas');
    if (!graphCanvas) { console.error('Graph canvas not found'); return; }
    graphCanvas.innerHTML = '';
    if (graph.length === 0) { console.error('No graph data'); return; }


    function __walkGraph(commit: string, level: number, childHtml: HTMLElement | null = null) {
      if (!graphCanvas) return;
      const node = graph.find((n) => n.commit === commit);
      if (!node) return;
      let hNode = __getGraphNode(node.commit, childHtml, level);

      let parentHtml = hNode.querySelector('.graph-parents') as HTMLElement;
      level++;
      node.parents.forEach((parent) => {
        console.log(`Commit: ${node.commit} Parent: ${parent} Level: ${level}`);
        __walkGraph(parent, level, parentHtml);
      });
    }


    function __getGraphLevelNode(level: number, graphCanvas: HTMLElement = document.getElementById('graph-canvas') as HTMLElement): HTMLElement {
      let parentHtml = document.getElementById(`graph-level-${level}`);
      if (parentHtml) return parentHtml;
      parentHtml = document.createElement('div');
      parentHtml.classList.add(`graph-level-${level}`);
      parentHtml.id = `graph-level-${level}`;
      graphCanvas.appendChild(parentHtml);
      return parentHtml;
    }

    function __getGraphNode(commit: string, childHtml: HTMLElement | null, level: number): HTMLElement {
      let hNode = document.getElementById(`graph-commit-wrapper-${commit}`);
      if (hNode) return hNode;

      hNode = document.createElement('div');
      hNode.classList.add('graph-commit-wrapper');
      hNode.id = `graph-commit-wrapper-${commit}`;
      if (!childHtml) childHtml = __getGraphLevelNode(level);
      childHtml.appendChild(hNode);
      let hCommit = document.createElement('div');
      hCommit.classList.add('graph-commit');
      hCommit.textContent = commit;
      hCommit.id = `graph-commit-${commit}`;
      hNode.appendChild(hCommit);
      const node = graph.find((n) => n.commit === commit);
      if (!node) return hNode;
      if (node.parents.length > 1) {
        const mergeNode = document.createElement('div');
        mergeNode.classList.add('graph-merge');
        mergeNode.id = `graph-merge-${node.parents.join('-')}`;
        hNode.appendChild(mergeNode);
      }
      let hParents = document.createElement('div');
      hParents.classList.add('graph-parents');
      hParents.id = `graph-parents-${commit}`;
      hNode.appendChild(hParents);
      return hNode;
    }

    __walkGraph(graph[0].commit, 0);

  }

}
new FrontApp();
