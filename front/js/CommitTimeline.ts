import FrontApp from "./FrontApp.js";
import { ICommit } from "./IInterfaces.js";
class CommitTimeline {
  private commits: ICommit[];
  private element: HTMLElement | undefined = undefined;
  private app: FrontApp;
  private selectedCommit?: ICommit;
  private aroundCommit: { parents: ICommit[], children: ICommit[] } = { parents: [], children: [] };
  private commitSize: { width: number, height: number } = { width: 600, height: 400 };
  private timelineSize: { width: number, height: number } = { width: 600, height: 700 };
  constructor(app: FrontApp, selectedCommit?: ICommit, options?: any) {
    this.app = app;
    this.commits = this.app.commits;
    if (this.commits.length === 0) {
      console.error('No commits found');
      return;
    }
    if (!selectedCommit) { selectedCommit = this.commits[0]; }
    this.selectedCommit = selectedCommit;
    if (options) { }
  }
  public render(element: HTMLElement) {
    this.element = element;
    this.element.innerHTML = '';
    this.setAroundCommit();
    console.log(this.aroundCommit);
    const fragment = document.createDocumentFragment();

    const timeline = document.createElement('div');
    timeline.classList.add('timeline');
    timeline.id = 'commit-timeline';

    const children = document.createElement('div');
    children.classList.add('ctl-children');
    children.classList.add('ctl-commit-next');
    children.style.transform = `translateY(-${50 + this.commitSize.height / 2}px) rotateX(60deg) translateZ(-${this.commitSize.width / 6}px)  scale(0.8)`;
    children.innerHTML = "children";


    const commit = document.createElement('div');
    commit.classList.add('ctl-commit');
    commit.classList.add('ctl-commit-current');
    commit.innerHTML = this.selectedCommit!.commit;
    commit.style.transform = `translateZ(0px) translateY(${(this.timelineSize.height / 2) - (this.commitSize.height / 2)}px) rotateX(0deg) `;


    const parents = document.createElement('div');
    parents.classList.add('ctl-parents');
    parents.classList.add('ctl-commit-prev');
    parents.style.transform = `translateY(${(this.timelineSize.height / 2) + (this.commitSize.height / 2)}px) rotateX(-60deg) translateZ(-${this.commitSize.width / 6}px)  scale(0.8)`;
    parents.innerHTML = "parents";

    fragment.appendChild(timeline);
    timeline.appendChild(children);
    timeline.appendChild(commit);
    timeline.appendChild(parents);

    this.element.appendChild(fragment);
    console.log(this.element);
    const that = this;
    document.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowUp') {
        that.moveUp();
      } else if (event.key === 'ArrowDown') {
        that.moveDown();
      }
    });

  }
  private setAroundCommit() {
    if (!this.selectedCommit) {
      console.error('No selected commit');
      return;
    }
    if (this.selectedCommit.parents
      && this.selectedCommit.parents.length > 0
      && this.selectedCommit.parents[0] !== "") {
      this.aroundCommit.parents = this.commits.filter((commit) => {
        return this.selectedCommit!.parents.includes(commit.commit);
      });
    }
    this.aroundCommit.children = this.commits.filter((commit) => {
      return commit.parents.includes(this.selectedCommit!.commit);
    });

  }

  private moveDown() {
    const timeline = document.getElementById('commit-timeline')!;

    let current = document.querySelector('.ctl-commit-current') as HTMLElement;
    let children = document.querySelector('.ctl-children') as HTMLElement;
    let parents = document.querySelector('.ctl-parents') as HTMLElement;

    const newChildren = document.createElement('div');
    newChildren.style.transform = 'translateZ(-400px) rotateX(120deg) scaleY(0)';
    newChildren.classList.add('ctl-children');

    // Transition children to current
    children.style.transform = 'translateZ(0px) translateY(140px) rotateX(0deg)';
    children.classList.replace('ctl-children', 'ctl-commit-current');

    // Transition current commit to parents
    current.style.transform = 'translateZ(-60px) translateY(340px) rotateX(-40deg)';
    current.classList.replace('ctl-commit-current', 'ctl-parents');


    parents.style.transform = 'translateZ(-400px) translateY(140px) rotateX(0deg) scaleY(0)';



    // Append to timeline and animate new children
    timeline.appendChild(newChildren);

    // Animate the new children scale
    setTimeout(() => {
      newChildren.style.transform = 'translateZ(-100px) translateY(0px) rotateX(80deg) scaleY(1)';
      parents.remove();
      console.log('removed');
    }, 50); // Add a small delay for smooth transition
  }

  private moveUp() {
    const timeline = document.getElementById('commit-timeline')!;

    let current = document.querySelector('.ctl-commit-current') as HTMLElement;
    let children = document.querySelector('.ctl-children') as HTMLElement;
    let parents = document.querySelector('.ctl-parents') as HTMLElement;

    // Transition children to current
    children.style.transform = 'translateZ(-400px) translateY(0px) rotateX(90deg) scaleY(0)';

    // Transition current commit to parents
    current.style.transform = 'translateZ(-100px) translateY(0px) rotateX(80deg)';
    current.classList.replace('ctl-commit-current', 'ctl-children');


    parents.classList.replace('ctl-parents', 'ctl-commit-current');
    parents.style.transform = 'translateZ(0px) translateY(140px) rotateX(0deg)';

    // Create new parent
    const newParents = document.createElement('div');
    newParents.style.transform = 'translateZ(-60px) rotateX(-90deg) scaleY(0)';
    newParents.classList.add('ctl-parents');

    // Append to timeline and animate new children
    timeline.appendChild(newParents);

    // Animate the new children scale
    setTimeout(() => {
      newParents.style.transform = 'translateZ(-60px) translateY(340px) rotateX(-40deg) scaleY(1)';
      children.remove();
      console.log('removed');
    }, 50); // Add a small delay for smooth transition
  }

}
export default CommitTimeline;
