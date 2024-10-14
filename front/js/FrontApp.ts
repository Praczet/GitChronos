// importing the Card class.
import { IServerResponse } from '../../server/models/IServerResponse.js';
import { ServerResponse } from '../../server/models/ServerResponse.js';
import { IProjectConfig } from '../../server/config/ConfigInterfaces.js';
import HttpService from '../../server/models/HttpService.js';
import { ICommit } from './IInterfaces.js';
import Graph from './Graph.js';
import CommitTimeline from './CommitTimeline.js';
import ToolTip from './ToolTip.js';

class FrontApp {
  private projects: IProjectConfig[] = [];
  private selectedProject: IProjectConfig | null = null;
  private theme: 'light' | 'dark' = 'light';
  public commits: ICommit[] = [];
  public tooltip = new ToolTip();
  public selectedCommit?: ICommit;
  private mainSection: HTMLElement | null = null;
  private view: "graph" | "commit" | "file" = 'graph';

  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeDOM();
      this.fetchProjects();
    });
  }

  private initializeDOM(): void {
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    if (prefersDarkScheme.matches) {
      this.switchTheme('dark');
    } else {
      this.switchTheme('light');
    }
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
    this.mainSection = document.getElementById('main-section');
    if (!this.mainSection) {
      console.error('Main section not found');
    }
  }

  private switchTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.theme = theme;
  }

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
        projectLi.addEventListener('click', () => {
          projectsUl.querySelectorAll('li').forEach((li) => li.classList.remove('selected'));
          projectsUl.classList.add('selected');
          projectLi.classList.add('selected');
          this.toggleASider(true);
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
  public toggleASider(forceFold: boolean = false): void {
    const aside = document.getElementById('app-sidebar');
    if (!aside) return;
    if (forceFold) { aside.classList.add('sidebar-folded'); return; }
    aside.classList.toggle('sidebar-folded');
  }

  public commitClicked(commit: ICommit): void {
    this.selectedCommit = commit;
    this.view = 'commit';
    console.log('Commit clicked:', commit);
    this.openCommitView();
  }

  private openCommitView(): void {
    if (!this.mainSection) return;
    this.mainSection.innerHTML = '';
    this.mainSection.classList.add('main-commit-view');
    const htmlCommit = document.createElement('div');
    htmlCommit.classList.add('commit-view');
    htmlCommit.id = 'commit-view';
    this.mainSection.appendChild(htmlCommit);
    this.tooltip.hide();
    const commitTimeline = new CommitTimeline(this, this.selectedCommit, {});
    commitTimeline.render(htmlCommit);

  }



  public getCurrentProject(): IProjectConfig | null {
    return this.selectedProject;
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
      this.commits = response.data ?? [];
      this.renderGraph();
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  }










  /**
  * It will render the graph data
   *
  * @param {{ commit: string, parents: string[], refs: string , cDate:string}[]} this.graph - list of commits
   */
  private renderGraph(): void {
    const branchesMarginX = 200;
    const refsMarginX = 0;
    const refsX = 0;
    const shiftX = 60;
    const shiftY = 50;
    const dx = 100;
    const dy = 30;
    let graphCanvas = document.getElementById('graph-canvas');
    if (!graphCanvas && this.mainSection) {
      this.mainSection.innerHTML = '<div id="graph-canvas"></div>';
      graphCanvas = document.getElementById('graph-canvas');
      console.warn('Graph canvas not found');
    }
    if (!graphCanvas) return;
    this.view = 'graph';


    const lGraph = new Graph(this, { branchesMarginX, refsMarginX, refsX, shiftX, shiftY, dx, dy });
    lGraph.render(graphCanvas);
  }

  public setToolTipContentCommit(commit: ICommit, reload: boolean): void {
    if (!commit) {
      this.tooltip.setContent('');
      return;
    }

    const dWrapper = document.createElement('div');
    dWrapper.classList.add('tt-commit');
    dWrapper.id = `tt-commit-${commit.commit}`;

    const h1 = document.createElement('h1');
    h1.innerHTML = `Commit: ${commit.commit}`;

    const dBody = document.createElement('div');
    dBody.classList.add('tt-body');
    dBody.innerHTML = `<p class="tt-message">${commit.message}</p><p class="tt-body-desc">${commit.body}</p>`;

    const dInfo = document.createElement('div');
    dInfo.classList.add('tt-info');

    const dAuthor = document.createElement('div');
    dAuthor.classList.add('tt-author');
    dAuthor.innerHTML = `<div class="tt-label">Author</div>
      <div>${commit.author ?? ''}</div>
      <div>&lt;${commit.email ?? ''}&gt;</div>
      <div>${commit.cDate ?? ''}</div>
    `;
    dInfo.appendChild(dAuthor);

    const dPrent = document.createElement('div');
    dPrent.classList.add('tt-parents');
    dPrent.innerHTML = `<div class="tt-label">Parents</div><div>${commit.parents.join('<br>')}</div>`;
    dInfo.appendChild(dPrent);

    const dFiles = document.createElement('div');
    if (commit.files && commit.files.length > 0) {
      dFiles.classList.add('tt-files');
      const fileStats = commit.files.reduce(
        (acc: Record<string, number>, file) => {
          if (!acc[file.status]) acc[file.status] = 0;
          acc[file.status]++;
          return acc;
        }
        , {});
      const aStatus = Object
        .keys(fileStats)
        .map((key) => `${this.getFileStatusIcons(key)} ${fileStats[key]} ${this.getFileStatusName(key)}`)
        .join(', ');



      dFiles.innerHTML = `<span><span class="tt-label">Files: </span>${aStatus}</span>`;
      const ul = document.createElement('ul');
      ul.classList.add('tt-files-list');
      commit.files.forEach((file) => {
        const li = document.createElement('li');
        li.innerHTML = `${this.getFileStatusIcons(file.status)} <span class='commit-dim-path'>${this.dimPath(file.file)}</span>`;
        ul.appendChild(li);
      });
      dFiles.appendChild(ul);
    }

    dWrapper.appendChild(h1);
    dWrapper.appendChild(dBody);
    dWrapper.appendChild(dInfo);
    dWrapper.appendChild(dFiles);

    this.tooltip.setContent(dWrapper.outerHTML, reload ? `tt-commit-${commit.commit}` : undefined);
  }

  private dimPath(path: string): string {
    const parts = path.split('/');
    if (parts.length === 1) return path;
    let newParts = parts.map(p => `<span class="commit-path">${p}</span>`);
    newParts[newParts.length - 1] = `<span class="commit-file-name">${parts[parts.length - 1]}</span>`;
    return newParts.join(`<span class="commit-path">/</span>`);
  }

  private getFileStatusName(status: string): string {
    switch (status) {
      case 'A':
        return 'added';
      case 'M':
        return 'modified';
      case 'D':
        return 'deleted';
      default:
        return 'unknown';
    }
  }
  private getFileStatusIcons(status: string): string {
    switch (status) {
      case 'A':
        return '<span class="commit-file-status status-a">+</span>';
      case 'M':
        return '<span class="commit-file-status status-m">#</span>';
      case 'D':
        return '<span class="commit-file-status status-d">-</span>';
      default:
        return `<span class="commit-file-status status-non">${status}</span>`;
    }
  }

  public async loadCommitData(commit: string, returnAction: string = ""): Promise<void> {
    try {
      const data = await HttpService.Fetch<IServerResponse<ICommit>>(
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
      if (this.commits) {
        const commit = this.commits.find((c) => c.commit === commitData.commit);
        if (commit) {
          commit.author = commitData.author;
          commit.email = commitData.email;
          commit.cDate = commitData.cDate;
          commit.message = commitData.message;
          commit.body = commitData.body;
          commit.files = commitData.files
          if (returnAction === 'loadToolTip') this.setToolTipContentCommit(commit, true);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }

  }

  public showToolTip(targetElement: HTMLElement, options: { position?: 'top' | 'bottom' | 'left' | 'right', dX?: number, dY?: number }): void {
    this.tooltip.show(targetElement, options);
  }
}
export default FrontApp;
new FrontApp();
