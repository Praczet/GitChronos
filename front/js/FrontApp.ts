// importing the Card class.
import { Card } from './Card.js';
import { IServerResponse } from '../../server/models/IServerResponse.js';
import { ServerResponse } from '../../server/models/ServerResponse.js';
import { IProjectConfig } from '../../server/config/ConfigInterfaces.js';
import HttpService from '../../server/models/HttpService.js';
import { IGraph } from './IFrontApp.js';

class FrontApp {
  private projects: IProjectConfig[] = [];
  private selectedProject: IProjectConfig | null = null;
  private theme: 'light' | 'dark' = 'light';
  private graph: IGraph[] = [];
  private commitPositionMap: Record<string, { x: number, y: number, row: number }> = {};
  private commitGrid: { commit: string, row: number, yC: number, yP: number, pCommit: string }[] = [];
  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeDOM();
      this.fetchProjects();
      // this.fetchCommits("");
    });
  }

  // Method to initialize the DOM
  private initializeDOM(): void {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
    // console.log(prefersDarkScheme);

    if (prefersDarkScheme.matches) {
      this.switchTheme('dark');
    } else {
      this.switchTheme('light');
    }
    // const stackContainer = document.getElementById('stack-container');
    // console.log(stackContainer);
    // if (stackContainer) {
    //   this.renderCards(stackContainer);
    // }
    const themeSwitch = document.getElementById('app-header');
    if (themeSwitch) {
      themeSwitch.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
          this.switchTheme('light');
        } else {
          this.switchTheme('dark');
        }
      });
    }
  }

  private switchTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    // console.log('Theme switched to:', theme);
    localStorage.setItem('theme', theme);
    this.theme = theme;
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
          this.selectedProject = project;
          if (this.selectedProject.theme !== undefined && this.theme !== this.selectedProject.theme)
            this.switchTheme(this.selectedProject.theme);
          this.fetchLogGraph(this.selectedProject);
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
          // console.log('Selected branch:', branch);
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
      // console.log(response.data);
      // console.log(response.data.filter((commit: Record<string, any>) => commit.refs !== ""));
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
      // console.log(response.data);
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
      // console.log(response.data);
      // this.renderBranches(response.data?.branches ?? []);
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }










  /**
  * It will render the graph data
   *
  * @param {{ commit: string, parents: string[], refs: string , cDate:string}[]} this.graph - list of commits
   */
  private renderGraph(graph: IGraph[]): void {
    const branchesMarginX = 200;
    const refsMarginX = 0;
    const refsX = 0;
    const shiftX = 60;
    const shiftY = 50;
    const dx = 100;
    const dy = 30;
    const graphCanvas = document.getElementById('graph-canvas');
    if (!graphCanvas) { console.error('Graph canvas not found'); return; }
    graphCanvas.innerHTML = '';
    this.graph = graph;
    const that = this;
    if (this.graph.length === 0) { console.error('No graph data'); return; }

    const graphPre = document.getElementById('graph-pre');
    this.commitPositionMap = {};
    this.commitGrid = [];
    let row = 0;

    this.graph.forEach((commit, index) => {
      let cPos = this.commitPositionMap[commit.commit];
      if (!cPos) {
        this.commitPositionMap[commit.commit] = { x: branchesMarginX + 0, y: index * shiftY, row: row };
        cPos = this.commitPositionMap[commit.commit];
      }
      const pgCommit = this.commitGrid.find((c) => c.pCommit === commit.commit);
      if (pgCommit) { pgCommit.yP = cPos.y; }

      if (commit.parents && commit.parents.length > 0) {
        commit.parents.forEach((parent, pIndex) => {
          let pPos = this.commitPositionMap[parent];
          if (!pPos) {

            this.commitPositionMap[parent] = { x: (shiftX * pIndex) + cPos.x, y: (index + 1) * shiftY, row: cPos.row + pIndex };
            pPos = this.commitPositionMap[parent];
            if (cPos.x === pPos.x) {
              let tCommit = this.commitGrid.find((c) => c.commit === commit.commit);
              if (!tCommit) this.commitGrid.push({ row: cPos.row, yC: cPos.y, yP: pPos.y, pCommit: parent, commit: commit.commit });
            } else {
            }
          } else {
            if (pPos.y < cPos.y) {
              pPos.y = (index + 1) * shiftY;
              const pEl = document.getElementById(`graph-commit-${parent}`);
              if (pEl) pEl.style.top = `${pPos.y}px`;
              let tCommit = this.commitGrid.find((c) => c.commit === commit.commit && c.pCommit === parent);
              if (tCommit) tCommit.yP = pPos.y;
            }
          }
        });

      }
    });

    if (graphPre) {
      graphPre.textContent = JSON.stringify(this.commitGrid, null, 2);
    }
    if (this.selectedProject?.checkOverlaps) __checkOverlapping();
    __drawCommits();
    __drawLines();
    __drawRefs();


    function __checkOverlapping() {
      const rows = Array.from(new Set(that.commitGrid.map((c) => c.row)));
      rows.forEach((row) => {
        let rowCommits = that.commitGrid.filter((c) => c.row === row);
        rowCommits.forEach((c) => {
          let double = rowCommits.filter((cc) => c.yC < cc.yC && c.yP > cc.yP && cc.commit !== c.commit);
          if (double.length > 0) {
            let tCommitPos = that.commitPositionMap[c.commit];
            if (tCommitPos) {
              double.forEach((dbl) => {
                __shiftCommit(dbl.commit, row + 1);
              });
            }
          }
        });
      });
    }

    function __shiftCommit(commit: string, row: number) {
      // cPos.x = tCommitPos.x + shiftX;
      // tCommitPos.row = tCommitPos.row + 1;
      let tCommitPos = that.commitPositionMap[commit];
      if (!tCommitPos) return;
      tCommitPos.x = tCommitPos.x + shiftX;
      tCommitPos.row = row;
      let cCommit = that.graph.find((c) => c.commit === commit);
      if (cCommit) {
        cCommit.parents.forEach((parent, pIndex) => {
          // console.log('parent', parent);
          let pPos = that.commitPositionMap[parent];
          if (pPos && pPos.row >= (row - 1)) __shiftCommit(parent, pPos.row + 1);
        });
      }

    }

    function __drawCommits() {
      const fragment = document.createDocumentFragment(); // Use a DocumentFragment
      that.graph.forEach((commit) => {
        const cPos = that.commitPositionMap[commit.commit];
        if (!cPos) { console.error('Commit position not found'); return; }
        const commitDiv = document.createElement('div');
        commitDiv.classList.add('graph-commit');
        commitDiv.style.left = `${cPos.x}px`;
        commitDiv.style.top = `${cPos.y}px`;
        commitDiv.textContent = commit.commit;
        commitDiv.id = `graph-commit-${commit.commit}`;
        commitDiv.addEventListener('mouseenter', () => {
          console.log('hover', commit);
          if (commit.parents && commit.parents.length > 0 && commit.parents[0] !== '') {
            commit.parents.forEach((parent) => {
              const line = document.querySelector(`.graph-line[data-parent="${parent}"][data-child="${commit.commit}"]`);
              if (line) line.classList.add('glow-50');
              const parentDiv = document.getElementById(`graph-commit-${parent}`);
              if (parentDiv) parentDiv.classList.add('glow-50');

            });
          }

          if (!commit.message) {
            that.loadCommitData(commit.commit);
          } else {
            console.log('Commit data already loaded, meeting:', commit.message);
          }
        });
        commitDiv.addEventListener('mouseleave', () => {
          if (commit.parents && commit.parents.length > 0 && commit.parents[0] !== '') {
            commit.parents.forEach((parent) => {
              const line = document.querySelector(`.graph-line[data-parent="${parent}"][data-child="${commit.commit}"]`);
              if (line) line.classList.remove('glow-50');
              const parentDiv = document.getElementById(`graph-commit-${parent}`);
              if (parentDiv) parentDiv.classList.remove('glow-50');
            });
          }
        });
        fragment.appendChild(commitDiv); // Add to fragment instead of directly to DOM
      });
      graphCanvas!.appendChild(fragment); // Append all at once
    }

    function __drawRefs() {
      const fragment = document.createDocumentFragment(); // Use a DocumentFragment
      that.graph.forEach((commit) => {
        const cPos = that.commitPositionMap[commit.commit];
        if (!cPos) { console.error('Commit position not found'); return; }
        if (commit.refs !== "") {
          const refDiv = document.createElement('div');
          refDiv.classList.add('graph-ref');
          refDiv.style.left = `${refsMarginX}px`;
          refDiv.style.top = `${cPos.y}px`;
          refDiv.textContent = commit.refs;
          fragment.appendChild(refDiv); // Add to fragment instead of directly to DOM

          const refDivLine = document.createElement('div');
          refDivLine.classList.add('graph-ref-line');
          refDivLine.style.left = `${refsMarginX + refsX}px`;
          refDivLine.style.top = `${cPos.y + dy / 2}px`;
          refDivLine.style.width = `${cPos.x - refsMarginX}px`;
          fragment.appendChild(refDivLine); // Add to fragment instead of directly to DOM

        }
      });
      graphCanvas!.appendChild(fragment); // Append all at once
    }

    function __drawLines() {
      const fragment = document.createDocumentFragment(); // Use a DocumentFragment
      that.graph.forEach((commit) => {
        let cPos = that.commitPositionMap[commit.commit];
        if (commit.parents && commit.parents.length > 0 && commit.parents[0] !== '') {
          commit.parents.forEach((parent, pIndex) => {
            let pPos = that.commitPositionMap[parent];
            const line = document.createElement('div');
            line.classList.add('graph-line');
            line.dataset.parent = parent;
            line.dataset.child = commit.commit;
            if (cPos.x === pPos.x && cPos.y < pPos.y) {
              line.classList.add('graph-line-vertical');
              line.style.left = `${cPos.x + dx / 2}px`;
              line.style.top = `${cPos.y + dy}px`;
              line.style.height = `${pPos.y - cPos.y - dy}px`;
            }
            // Add other conditions here (top-right, bottom-right)
            if (cPos.x === pPos.x && cPos.y < pPos.y) {
              line.classList.add('graph-line-vertical');
              line.style.left = `${cPos.x + dx / 2}px`;
              line.style.top = `${cPos.y + dy}px`;
              line.style.height = `${pPos.y - cPos.y - dy}px`;
            }
            if (cPos.x < pPos.x) {
              line.classList.add('graph-line-top-right');
              line.style.left = `${cPos.x + dx}px`;
              line.style.top = `${cPos.y + dy / 2}px`;
              line.style.width = `${pPos.x - cPos.x - dx / 2}px`;
              line.style.height = `${pPos.y - cPos.y}px`;
            }

            if (cPos.x > pPos.x) {
              line.classList.add('graph-line-bottom-right');
              line.style.left = `${pPos.x + dx}px`;
              line.style.top = `${cPos.y + dy}px`;
              line.style.width = `${cPos.x - pPos.x - dx / 2}px`;
              line.style.height = `${pPos.y - cPos.y - dy / 2}px`;
            }
            line.addEventListener('mouseenter', () => {
              const child = document.getElementById(`graph-commit-${line.dataset.child}`);
              const parent = document.getElementById(`graph-commit-${line.dataset.parent}`);
              if (child) child.classList.add('hover');
              if (parent) parent.classList.add('hover');

            });
            line.addEventListener('mouseleave', () => {
              const child = document.getElementById(`graph-commit-${line.dataset.child}`);
              const parent = document.getElementById(`graph-commit-${line.dataset.parent}`);
              if (child) child.classList.remove('hover');
              if (parent) parent.classList.remove('hover');
            });
            fragment.appendChild(line); // Add to fragment instead of directly to DOM
          });
        }
      });
      graphCanvas!.appendChild(fragment); // Append all at once
    }
  }

  private async loadCommitData(commit: string): Promise<void> {
    try {
      const data = await HttpService.Fetch<IServerResponse<IGraph>>(
        '/api/git/commit',
        { commitHash: commit, path: this.selectedProject?.path ?? "" },
        { method: "POST" }
      );
      const response = new ServerResponse(data);
      if (response.isError()) {
        console.error(response.message);
        return;
      }
      const commitData = response.data;
      console.log('Commit data:', commitData);
    } catch (error) {
      console.error('Unexpected error:', error);
    }

  }

}
new FrontApp();
