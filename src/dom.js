const onePlayerBtn = document.querySelector('.one-player-button');
const twoPlayerBtn = document.querySelector('.two-player-button');
const startingScreen = document.querySelector('.starting-screen');
const placementScreen = document.querySelector('.placement-screen');
const transitionScreen = document.querySelector('.transition-screen');
const harborText = document.querySelector('.harbor>h1');

onePlayerBtn.addEventListener('click', () => {
  startingScreen.style.opacity = '0%';

  setTimeout(() => {
    startingScreen.style.display = 'none';
    placementScreen.style.pointerEvents = 'auto';
    placementScreen.style.opacity = '100%';
  }, 2000);
});
twoPlayerBtn.addEventListener('click', () => {
  harborText.textContent = 'Player One: \n Drag your ships out to sea';
  startingScreen.style.opacity = '0%';

  setTimeout(() => {
    startingScreen.style.display = 'none';
    transitionScreen.style.pointerEvents = 'auto';
    transitionScreen.style.opacity = '100%';
  }, 2000);
});
transitionScreen.addEventListener('click', () => {
  transitionScreen.style.opacity = '0%';
  transitionScreen.style.pointerEvents = 'none';
  setTimeout(() => {
    placementScreen.style.pointerEvents = 'auto';
    placementScreen.style.opacity = '100%';
  }, 500);
});
