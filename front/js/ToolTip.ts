
type TPosition = 'left' | 'right' | 'top' | 'bottom';

class ToolTip {
  private tooltipElement: HTMLElement;
  private contentElement: HTMLElement;
  private indicatorElement: HTMLElement;
  private defaultPosition: TPosition = 'right';
  private content: string = '';

  constructor() {
    // Create tooltip and indicator elements
    this.tooltipElement = document.createElement('div');
    this.tooltipElement.classList.add('tooltip');

    // Add transition styles
    this.tooltipElement.style.transition = 'top 0.3s ease, left 0.3s ease, opacity 0.3s ease';
    this.tooltipElement.style.position = 'absolute';
    this.tooltipElement.style.opacity = '0'; // Initially hidden


    this.indicatorElement = document.createElement('div');
    this.indicatorElement.classList.add('tooltip-indicator');
    this.tooltipElement.appendChild(this.indicatorElement);

    this.contentElement = document.createElement('div');
    this.contentElement.classList.add('tooltip-content');
    this.tooltipElement.appendChild(this.contentElement);

    document.body.appendChild(this.tooltipElement);
  }

  public show(
    targetElement: HTMLElement | { top: number; left: number; },
    options: {
      position?: TPosition;
      dX?: number;
      dY?: number;
      content?: string;
      dIndY?: number;
    } = {}
  ): void {
    let position: TPosition = options.position ?? this.defaultPosition;
    let top: number;
    let left: number;
    let dIndY: number = options.dIndY ?? 0;

    if (targetElement instanceof HTMLElement) {
      // If target is an HTML element, get its bounding box and calculate position
      const rect = targetElement.getBoundingClientRect();
      top = rect.top + window.scrollY + (options.dY ?? 0);
      left = rect.left + window.scrollX + (options.dX ?? 0);
      position = this.defaultPosition;
    } else {
      // If target is an object with top and left, use provided values
      top = targetElement.top + (options.dY ?? 0);
      left = targetElement.left + (options.dX ?? 0);
    }

    // Adjust tooltip position based on specified direction
    switch (position) {
      case 'top':
        this.tooltipElement.style.top = `${top - this.tooltipElement.offsetHeight - 10}px`;
        this.tooltipElement.style.left = `${left}px`;
        this.adjustIndicator('bottom');
        break;
      case 'bottom':
        this.tooltipElement.style.top = `${top + 10}px`;
        this.tooltipElement.style.left = `${left}px`;
        this.adjustIndicator('top');
        break;
      case 'left':
        this.tooltipElement.style.top = `${top}px`;
        this.tooltipElement.style.left = `${left - this.tooltipElement.offsetWidth - 10}px`;
        this.adjustIndicator('right');
        break;
      case 'right':
      default:
        this.tooltipElement.style.top = `${top}px`;
        this.tooltipElement.style.left = `${left + 10}px`;
        this.adjustIndicator('left');
        break;
    }

    // Show the tooltip with opacity transition
    this.tooltipElement.style.opacity = '1';
    this.tooltipElement.style.pointerEvents = 'auto';
  }

  public hide(): void {
    // Hide the tooltip with opacity transition
    this.tooltipElement.style.opacity = '0';
    this.tooltipElement.style.pointerEvents = 'none';
  }

  // Adjust the indicator triangle based on position
  private adjustIndicator(direction: TPosition): void {
    this.indicatorElement.className = `tooltip-indicator tooltip-indicator-${direction}`;
  }
  public setContent(newContent: string, elID?: string): void {
    this.content = newContent;
    if (!this.contentElement) return;
    if (!elID) {
      this.contentElement.innerHTML = `${this.content}`;
      return;
    }
    const el = this.contentElement.querySelector(`#${elID}`);
    // console.log('setContent:el', el);
    if (!el) return;
    // console.log('content', this.content);
    el.innerHTML = `${this.content}`;
  }
}

export default ToolTip;
