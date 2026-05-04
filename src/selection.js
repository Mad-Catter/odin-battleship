import { generateRandomPlacements } from './classes.js';
let currentShip = null;
let currentlyDragging = false;
const placedSquares = [];
const shipPlacements = [];
const go = document.querySelector('.go');

const shipContainers = document.querySelectorAll('.ship-container');
shipContainers.forEach((cont) => {
  // Each ship has 3 icons in various sizes, a main ship (shown on the left), a mini ship (follows the mouse when "dragging"), and a big ship (shown on the board).
  const ship = cont.querySelector('.main-ship');
  const miniShip = cont.querySelector('.mini-ship');
  const search = '.board-' + ship.classList[0];
  const bigShip = document.querySelector(search);
  const btn = cont.querySelector('button');
  function flipButton() {
    btn.classList.toggle('horz');
    btn.classList.toggle('vert');
    if (btn.classList.contains('horz')) {
      btn.textContent = 'Horz';
    } else {
      btn.textContent = 'Vert';
    }
    ship.classList.toggle('flipped');
    bigShip.classList.toggle('flipped');
    miniShip.classList.toggle('flipped');
  }
  btn.addEventListener('click', flipButton);

  function moveShip(e) {
    e.preventDefault();
    currentShip = {
      orient: btn.classList.contains('horz') ? 'horz' : 'vert',
      shipName: ship.classList[0],
      length:
        ship.classList[0] === 'carrier'
          ? 5
          : ship.classList[0] === 'battle'
            ? 4
            : ship.classList[0] === 'sub' || ship.classList[0] === 'destroy'
              ? 3
              : 2,
      bigShip: document.querySelector(search),
      miniShip: miniShip,
      flipShip() {
        flipButton();
        this.orient = this.orient === 'horz' ? 'vert' : 'horz';
        // This updates the hovered squares to the new orientation.
        if (hoveredSquares[0]) {
          const square = hoveredSquares[0];
          square.dispatchEvent(new Event('mouseleave'));
          square.dispatchEvent(new Event('mouseover'));
        }
      },
      placeShip() {
        ship.classList.add('placed-ship');
        btn.setAttribute('disabled', '');
      },
      displaceShip() {
        ship.classList.remove('placed-ship');
        btn.removeAttribute('disabled');
      },
    };
    currentShip.displaceShip();
    currentShip.bigShip.classList.add('currently-dragging');
    // This is to remove the big ship from the board if we are replacing the ship starting from the smaller ship on th left
    currentShip.bigShip.style.top = '-5000px';

    // This removes the ship and the squares it occupies from the ship placement, this is incase the ship is being re-placed.  Go is also set to disabled for the same reason
    for (let i = placedSquares.length; i > 0; i--) {
      const square = placedSquares[i - 1];
      if (square[1] === currentShip.shipName) {
        square[0].classList.remove('placed-square');
        placedSquares.splice(i - 1, 1);
      }
    }
    for (let i = shipPlacements.length; i > 0; i--) {
      const placement = shipPlacements[i - 1];
      if (placement[0] === currentShip.shipName) {
        shipPlacements.splice(i - 1, 1);
      }
    }
    go.setAttribute('disabled', '');
    currentlyDragging = true;
  }
  ship.addEventListener('dragstart', moveShip);
  bigShip.addEventListener('dragstart', moveShip);
});

// We only want the large ship to follow the user's mouse on the board.  If the mouse is not on the board, we hide the ship.
const placementBoard = document.querySelector('.placement-board');
placementBoard.addEventListener('mouseout', () => {
  if (currentShip) currentShip.bigShip.style.top = '-5000px';
});
// On the reverse, we only want the mini ship to be shown while the user is not on the board.
// The html dragging API was causing errors and additionaly did not let the mouse wheel to be used while dragging.
// So I remade the wheel a bit by making my own version of dragging.  The mini ship following the mouse is to give feedback that the user is in fact dragging something.
document.addEventListener('mousemove', (e) => {
  if (!placementBoard.matches(':hover') && currentShip) {
    currentShip.miniShip.style.top = e.pageY + 10 + 'px';
    currentShip.miniShip.style.left = e.pageX - 40 + 'px';
  } else if (placementBoard.matches(':hover') && currentShip) {
    currentShip.miniShip.style.top = 50000 + 'px';
  }
});

document.addEventListener('wheel', () => {
  if (currentShip) currentShip.flipShip();
});
const hoveredSquares = [];
const boardSquares = document.querySelectorAll('.square');
let validPlacement = false;
for (const square of boardSquares) {
  // Each square's class list is in the format: square x# y#
  const squareX = Number(square.classList[1].charAt(1));
  const squareY = Number(square.classList[2].charAt(1));
  square.addEventListener('mouseleave', () => {
    if (currentlyDragging) {
      for (let i = hoveredSquares.length; i > 0; i--) {
        const square = hoveredSquares.pop();
        square.classList.remove('is-invalid');
        square.classList.remove('is-hovered');
      }
    }
  });
  square.addEventListener('mouseover', () => {
    if (currentlyDragging) {
      const currentSquares = [];
      let invalid = false;
      // This checks if the current length of the ship would go off the board if placed on the current square.
      for (let i = 0; i < currentShip.length; i++) {
        let search;
        // This is less efficent time wise than having the if statement outside the loop but it is easier to read and more space efficent.
        // So on this small project I am doing it the short way.
        if (currentShip.orient === 'horz') {
          search = `.x${squareX + i}.y${squareY}`;
        } else {
          search = `.x${squareX}.y${squareY - i}`;
        }
        const hoveredSquare = document.querySelector(search);
        // We break here because this means the hovered square is off the board and therefore non-existant.  We dont want to add that to our later code.
        if (hoveredSquare === null) {
          invalid = true;
          break;
        }
        currentSquares.push(hoveredSquare);
      }
      // This if statement is to prevent rechecking code we already know is invalid.  It isn't required but may make things faster.
      if (!invalid) {
        if (placedSquares.some((arr) => currentSquares.includes(arr[0]))) invalid = true;
      }
      // If the current hovered square is an invalid placement, we give the squares a red background color.
      if (invalid) {
        for (const square of currentSquares) {
          square.classList.add('is-invalid');
          hoveredSquares.push(square);
          validPlacement = false;
        }
      } else {
        for (const square of currentSquares) {
          square.classList.add('is-hovered');
          hoveredSquares.push(square);
          validPlacement = true;
        }
      }
      // The board ship is moved to cover the squares that are currently being hovered.
      // These measurments were found through manually checking what looks best with each image.
      if (currentShip.orient === 'horz') {
        currentShip.bigShip.style.top =
          square.offsetTop + (currentShip.shipName === 'carrier' || currentShip.shipName === 'battle' ? 0 : 15) + 'px';
        currentShip.bigShip.style.left =
          square.offsetLeft +
          (currentShip.shipName === 'carrier' || currentShip.shipName === 'battle'
            ? -2.5
            : currentShip.shipName === 'destroy' || currentShip.shipName === 'sub'
              ? 15
              : 5) +
          'px';
      } else {
        currentShip.bigShip.style.top =
          square.offsetTop +
          (currentShip.shipName === 'carrier'
            ? 150
            : currentShip.shipName === 'battle'
              ? 115
              : currentShip.shipName === 'destroy' || currentShip.shipName === 'sub'
                ? 90
                : 45) +
          'px';
        currentShip.bigShip.style.left =
          square.offsetLeft +
          (currentShip.shipName === 'carrier'
            ? -150
            : currentShip.shipName === 'battle'
              ? -115
              : currentShip.shipName === 'destroy' || currentShip.shipName === 'sub'
                ? -65
                : -30) +
          'px';
      }
    }
  });
  square.addEventListener('mouseup', () => {
    if (currentlyDragging) {
      if (validPlacement) {
        if (currentShip.orient === 'horz') {
          for (let i = 0; i < currentShip.length; i++) {
            const search = `.x${squareX + i}.y${squareY}`;
            const validSquare = document.querySelector(search);
            placedSquares.push([validSquare, currentShip.shipName]);
            validSquare.classList.add('placed-square');
          }
        } else {
          for (let i = 0; i < currentShip.length; i++) {
            const search = `.x${squareX}.y${squareY - i}`;
            const validSquare = document.querySelector(search);
            placedSquares.push([validSquare, currentShip.shipName]);
            validSquare.classList.add('placed-square');
          }
        }
        currentShip.placeShip();
        //TODO: consider changing horz/ vert instead of doing this charAt(0) thing
        shipPlacements.push([currentShip.shipName, squareX, squareY, currentShip.orient.charAt(0)]);
        if (shipPlacements.length === 5) go.removeAttribute('disabled', '');
      } else {
        currentShip.bigShip.style.top = '-5000px';
      }
      for (let i = hoveredSquares.length; i > 0; i--) {
        const square = hoveredSquares.pop();
        square.classList.remove('is-invalid');
        square.classList.remove('is-hovered');
      }
    }
  });
}
document.addEventListener('mouseup', () => {
  if (currentShip !== null) {
    currentShip.miniShip.style.top = 50000 + 'px';
    currentShip.bigShip.classList.remove('currently-dragging');
    currentShip = null;
    currentlyDragging = false;
  }
});

function clearSelection() {
  for (const square of placedSquares) {
    square[0].classList.remove('placed-square');
  }
  placedSquares.length = 0;
  shipPlacements.length = 0;
  const bigShips = placementBoard.querySelectorAll('.big-ship');
  for (const ship of bigShips) {
    ship.style.top = '-5000px';
    ship.classList.remove('flipped');
  }
  const mainShips = document.querySelectorAll('.main-ship');
  for (const ship of mainShips) {
    ship.classList.remove('placed-ship');
    ship.classList.remove('flipped');
  }
  const miniShips = document.querySelectorAll('.mini-ship');
  for (const ship of miniShips) {
    ship.classList.remove('flipped');
  }
  const orientBtns = document.querySelectorAll('.orient');
  for (const btn of orientBtns) {
    btn.classList.remove('vert');
    btn.classList.add('horz');
    btn.textContent = 'Horz';
    btn.removeAttribute('disabled');
  }
  go.setAttribute('disabled', '');
}

// This is an incredibly poor way of doing this.  I wanted to have the user be able to click the random button repeatedly until they got a board they were happy with.
// However, that would involve reworking quite a bit of the code to allow each ship to be placed on the board visually, and I just want this project to be done at this point.
const random = document.querySelector('.random');
random.addEventListener('click', () => {
  clearSelection();
  const randomPlacements = generateRandomPlacements();
  shipPlacements.length = 0;
  for (const placement of randomPlacements) shipPlacements.push(placement);
  go.removeAttribute('disabled');
  go.click();
});

export { shipPlacements, clearSelection };
