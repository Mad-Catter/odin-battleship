// Selection screen
// Currently have x and y coords and a horz/vert button.  Once x and y are inputted (even if not valid) the image of the ship should move to the board.
// Ideally there would be a shadow where the ship was before.  Even more ideally if the ship is in an invalid spot, invalid parts will be in red.
// Clicking the vert/horz button should change the orientation of the ship.
// Once go is clicked an error should pop up if there are invalid places/unplaced items.  Once all is finished go to next screen.
// Also drag and drop ships should be a thing, however that means changing the harbor up to have enough space for each ship.
// Maybe can change vert horz to flipping 90degs each time for more customization of boards.
let currentShip = null;
let currentlyDragging = false;
const placedSquares = [];
const shipPlacements = [];
const go = document.querySelector('.go');
const shipContainers = document.querySelectorAll('.ship-container');

shipContainers.forEach((cont) => {
  const ship = cont.querySelector('.main-ship');
  const miniShip = cont.querySelector('.mini-ship');
  const search = '.board-' + ship.classList[0];
  const bigShip = document.querySelector(search);
  const btn = cont.querySelector('button');
  btn.addEventListener('click', (e) => {
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
  });

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
      flip() {
        btn.click();
        this.orient = this.orient === 'horz' ? 'vert' : 'horz';
        if (hoveredSquares[0]) {
          const square = hoveredSquares[0];
          square.dispatchEvent(new Event('mouseleave'));
          square.dispatchEvent(new Event('mouseover'));
        }
      },
      disableFlip() {
        ship.classList.add('placed');
        btn.setAttribute('disabled', '');
      },
      enableFlip() {
        ship.classList.remove('placed');
        btn.removeAttribute('disabled');
      },
    };
    currentShip.enableFlip();
    currentShip.bigShip.classList.add('currently-dragging');
    // to remove the big ship from the board if replaceing using the smaller ship from the harbor
    currentShip.bigShip.style.top = '-5000px';

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

const placementBoard = document.querySelector('.placement-board');
placementBoard.addEventListener('mouseout', () => {
  if (currentShip) currentShip.bigShip.style.top = '-5000px';
});
document.addEventListener('wheel', () => {
  if (currentShip) currentShip.flip();
});
document.addEventListener('mousemove', (e) => {
  if (!placementBoard.matches(':hover') && currentShip) {
    currentShip.miniShip.style.top = e.pageY + 10 + 'px';
    currentShip.miniShip.style.left = e.pageX - 40 + 'px';
  } else if (placementBoard.matches(':hover') && currentShip) {
    currentShip.miniShip.style.top = 50000 + 'px';
  }
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
      // These measurments were found through manually checking what looks best with each image on each square.
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
        currentShip.disableFlip();
        // consider changing horz/ vert instead of doing this charAt(0) thing
        shipPlacements.push([currentShip.shipName, squareX, squareY, currentShip.orient.charAt(0)]);
        console.log(shipPlacements);
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

export default shipPlacements;
