// importing the Card class.
import { Card } from './Card.js';

// whats now
document.addEventListener('DOMContentLoaded', () => {
  const stackContainer = document.getElementById('stack-container');
  console.log(stackContainer);
  if (stackContainer) {
    // Example: Creating multiple cards using the Card class
    fetch('/api/commits')
      .then(response => response.json())
      .then(data => {
        const stackContainer = document.getElementById('stack-container');
        if (stackContainer && data.all) {
          data.all.forEach((commit: any) => {
            const card = new Card(commit.message);
            card.addHoverEffect();
            stackContainer.appendChild(card.getElement());
          });
        }
      });
    // for (let i = 0; i < 5; i++) {
    //   const card = new Card(`Commit #${i + 1}`);
    //   card.addHoverEffect();
    //   stackContainer.appendChild(card.getElement());
    // }
  }
});
