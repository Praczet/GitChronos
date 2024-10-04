// src/js/Card.ts

export class Card {
  private message: string;
  private element: HTMLElement;

  constructor(message: string) {
    this.message = message;
    this.element = this.createElement();
  }

  // Method to create a card element
  private createElement(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'bg-blue-500 text-white p-4 rounded-md mb-2 shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg ';
    card.textContent = this.message;
    return card;
  }

  // Method to get the HTMLElement for appending to the DOM
  public getElement(): HTMLElement {
    return this.element;
  }

  // Method to add event listeners or more functionalities to the card
  public addHoverEffect(): void {
    this.element.addEventListener('mouseenter', () => {
      this.element.style.transform = 'scale(1.05)';
    });

    this.element.addEventListener('mouseleave', () => {
      this.element.style.transform = 'scale(1.0)';
    });
  }
}
