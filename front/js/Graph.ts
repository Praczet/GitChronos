import ToolTip from "./ToolTip.js";
import { ICommit } from "./IInterfaces.js";
import FrontApp from "./FrontApp.js";


class Graph {
  private commitPositionMap: Record<string, { x: number, y: number, row: number }> = {};
  private commitGrid: { commit: string, row: number, yC: number, yP: number, pCommit: string }[] = [];
  private commits: ICommit[];
  private element: HTMLElement | undefined = undefined;
  private branchesMarginX = 200;
  private refsMarginX = 0;
  private refsX = 0;
  private shiftX = 60;
  private shiftY = 50;
  private dx = 100;
  private dy = 30;

  private app: FrontApp;


  constructor(app: FrontApp, options?: any) {
    this.app = app;
    this.commits = this.app.commits;

    if (options) {
      this.branchesMarginX = options.branchesMarginX || this.branchesMarginX;
      this.refsMarginX = options.refsMarginX || this.refsMarginX;
      this.shiftX = options.shiftX || this.shiftX;
      this.shiftY = options.shiftY || this.shiftY;
      this.dx = options.dx || this.dx;
      this.dy = options.dy || this.dy;
    }
  }

  public render(element: HTMLElement) {
    this.element = element;
    this.element.innerHTML = '';
    this.calculatePositions();
    const project = this.app?.getCurrentProject();
    if (project && project.checkOverlaps === true) this.checkOverlaps();
    this.drawCommits();
    this.drawLines();
    this.drawRefs();

  }

  private calculatePositions() {
    this.commitPositionMap = {};
    this.commitGrid = [];

    let row = 0;

    this.commits.forEach((commit, index) => {
      let cPos = this.commitPositionMap[commit.commit];
      if (!cPos) {
        this.commitPositionMap[commit.commit] = {
          x: this.branchesMarginX + 0,
          y: index * this.shiftY,
          row: row
        };
        cPos = this.commitPositionMap[commit.commit];
      }
      const pgCommit = this.commitGrid.find((c) => c.pCommit === commit.commit);
      if (pgCommit) { pgCommit.yP = cPos.y; }

      if (commit.parents && commit.parents.length > 0) {
        commit.parents.forEach((parent, pIndex) => {
          let pPos = this.commitPositionMap[parent];
          if (!pPos) {
            this.commitPositionMap[parent] = {
              x: (this.shiftX * pIndex) + cPos.x,
              y: (index + 1) * this.shiftY,
              row: cPos.row + pIndex
            };
            pPos = this.commitPositionMap[parent];
            if (cPos.x === pPos.x) {
              let tCommit = this.commitGrid.find((c) => c.commit === commit.commit);
              if (!tCommit) this.commitGrid.push({
                row: cPos.row,
                yC: cPos.y,
                yP: pPos.y,
                pCommit: parent,
                commit: commit.commit
              });
            } else {
            }
          } else {
            if (pPos.y < cPos.y) {
              pPos.y = (index + 1) * this.shiftY;
              const pEl = document.getElementById(`graph-commit-${parent}`);
              if (pEl) pEl.style.top = `${pPos.y}px`;
              let tCommit = this.commitGrid.find((c) => c.commit === commit.commit && c.pCommit === parent);
              if (tCommit) tCommit.yP = pPos.y;
            }
          }
        });

      }
    });


  }

  private checkOverlaps() {
    const rows = Array.from(new Set(this.commitGrid.map((c) => c.row)));
    const maxRow = Math.max(...rows);
    this.setGraphWidth(maxRow);
    rows.forEach((row) => {
      let rowCommits = this.commitGrid.filter((c) => c.row === row);
      rowCommits.forEach((c) => {
        let double = rowCommits.filter((cc) => c.yC < cc.yC && c.yP > cc.yP && cc.commit !== c.commit);
        if (double.length > 0) {
          let tCommitPos = this.commitPositionMap[c.commit];
          if (tCommitPos) {
            double.forEach((dbl) => {
              this.shiftCommit(dbl.commit, row + 1);
            });
          }
        }
      });
    });
  }
  private drawCommits() {
    const fragment = document.createDocumentFragment(); // Use a DocumentFragment
    this.commits.forEach((commit) => {
      const cPos = this.commitPositionMap[commit.commit];
      if (!cPos) { console.error('Commit position not found'); return; }
      const commitDiv = document.createElement('div');
      commitDiv.classList.add('graph-commit');
      commitDiv.style.left = `${cPos.x}px`;
      commitDiv.style.top = `${cPos.y}px`;
      commitDiv.textContent = commit.commit;
      commitDiv.id = `graph-commit-${commit.commit}`;
      commitDiv.addEventListener('mouseenter', () => {
        if (commit.parents && commit.parents.length > 0 && commit.parents[0] !== '') {
          commit.parents.forEach((parent) => {
            const line = document.querySelector(`.graph-line[data-parent="${parent}"][data-child="${commit.commit}"]`);
            if (line) line.classList.add('glow-50');
            const parentDiv = document.getElementById(`graph-commit-${parent}`);
            if (parentDiv) parentDiv.classList.add('glow-50');

          });
        }

        this.app!.setToolTipContentCommit(commit, false);
        if (!commit.message) {
          this.app!.loadCommitData(commit.commit, 'loadToolTip');
        }
        this.app!.tooltip.show(commitDiv, { dX: this.dx * 1.1, dY: 0 });
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
        this.app!.tooltip.hide();
      });
      fragment.appendChild(commitDiv); // Add to fragment instead of directly to DOM
    });
    this.element!.appendChild(fragment); // Append all at once
  }
  private drawLines() {
    const fragment = document.createDocumentFragment(); // Use a DocumentFragment
    this.commits.forEach((commit) => {
      let cPos = this.commitPositionMap[commit.commit];
      if (commit.parents && commit.parents.length > 0 && commit.parents[0] !== '') {
        commit.parents.forEach((parent, pIndex) => {
          let pPos = this.commitPositionMap[parent];
          const line = document.createElement('div');
          line.classList.add('graph-line');
          line.dataset.parent = parent;
          line.dataset.child = commit.commit;
          if (cPos.x === pPos.x && cPos.y < pPos.y) {
            line.classList.add('graph-line-vertical');
            line.style.left = `${cPos.x + this.dx / 2}px`;
            line.style.top = `${cPos.y + this.dy}px`;
            line.style.height = `${pPos.y - cPos.y - this.dy}px`;
          }
          // Add other conditions here (top-right, bottom-right)
          if (cPos.x === pPos.x && cPos.y < pPos.y) {
            line.classList.add('graph-line-vertical');
            line.style.left = `${cPos.x + this.dx / 2}px`;
            line.style.top = `${cPos.y + this.dy}px`;
            line.style.height = `${pPos.y - cPos.y - this.dy}px`;
          }
          if (cPos.x < pPos.x) {
            line.classList.add('graph-line-top-right');
            line.style.left = `${cPos.x + this.dx}px`;
            line.style.top = `${cPos.y + this.dy / 2}px`;
            line.style.width = `${pPos.x - cPos.x - this.dx / 2}px`;
            line.style.height = `${pPos.y - cPos.y}px`;
          }

          if (cPos.x > pPos.x) {
            line.classList.add('graph-line-bottom-right');
            line.style.left = `${pPos.x + this.dx}px`;
            line.style.top = `${cPos.y + this.dy}px`;
            line.style.width = `${cPos.x - pPos.x - this.dx / 2}px`;
            line.style.height = `${pPos.y - cPos.y - this.dy / 2}px`;
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
    this.element!.appendChild(fragment); // Append all at once
  }

  private drawRefs() {
    const fragment = document.createDocumentFragment(); // Use a DocumentFragment
    this.commits.forEach((commit) => {
      const cPos = this.commitPositionMap[commit.commit];
      if (!cPos) { console.error('Commit position not found'); return; }
      if (commit.refs !== "") {
        const refDiv = document.createElement('div');
        refDiv.classList.add('graph-ref');
        refDiv.style.left = `${this.refsMarginX}px`;
        refDiv.style.top = `${cPos.y}px`;
        refDiv.textContent = commit.refs;
        fragment.appendChild(refDiv); // Add to fragment instead of directly to DOM

        const refDivLine = document.createElement('div');
        refDivLine.classList.add('graph-ref-line');
        refDivLine.style.left = `${this.refsMarginX + this.refsX}px`;
        refDivLine.style.top = `${cPos.y + this.dy / 2}px`;
        refDivLine.style.width = `${cPos.x - this.refsMarginX}px`;
        fragment.appendChild(refDivLine); // Add to fragment instead of directly to DOM

      }
    });
    this.element!.appendChild(fragment); // Append all at once
  }

  private setGraphWidth(maxRow: number) {
    if (!this.element) return;
    let width = 0;
    let inMaxRow = this.commitGrid.filter((c) => c.row === maxRow);
    if (inMaxRow.length > 0) {
      let lastCommit = inMaxRow[inMaxRow.length - 1];
      let lastCommitPos = this.commitPositionMap[lastCommit.commit];
      if (lastCommitPos) width = lastCommitPos.x + this.dx;
    }
    this.element.style.width = `${width}px`;
  }

  private shiftCommit(commit: string, row: number) {
    // cPos.x = tCommitPos.x + shiftX;
    // tCommitPos.row = tCommitPos.row + 1;
    let tCommitPos = this.commitPositionMap[commit];
    if (!tCommitPos) return;
    tCommitPos.x = tCommitPos.x + this.shiftX;
    tCommitPos.row = row;
    let cCommit = this.commits.find((c) => c.commit === commit);
    if (cCommit) {
      cCommit.parents.forEach((parent, pIndex) => {
        let pPos = this.commitPositionMap[parent];
        if (pPos && pPos.row >= (row - 1)) this.shiftCommit(parent, pPos.row + 1);
      });
    }

  }

}

export default Graph;
