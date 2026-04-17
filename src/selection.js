// Selection screen
// Currently have x and y coords and a horz/vert button.  Once x and y are inputted (even if not valid) the image of the ship should move to the board.
// Ideally there would be a shadow where the ship was before.  Even more ideally if the ship is in an invalid spot, invalid parts will be in red.
// Clicking the vert/horz button should change the orientation of the ship.
// Once go is clicked an error should pop up if there are invalid places/unplaced items.  Once all is finished go to next screen.
// Also drag and drop ships should be a thing, however that means changing the harbor up to have enough space for each ship.
// Maybe can change vert horz to flipping 90degs each time for more customization of boards.

// const orientBtns = document.querySelectorAll('.orient');

// orientBtns.forEach((btn) => {
//   const shipClass = '.' + btn.id.replace('-orient', '');
//   const ship = document.querySelector(shipClass);
//   btn.addEventListener('click', (e) => {
//     btn.classList.toggle('horz');
//     btn.classList.toggle('vert');
//     if (btn.classList.contains('horz')) {
//       btn.textContent = 'Horz';
//     } else {
//       btn.textContent = 'Vert';
//     }
//     ship.classList.toggle('flipped');
//   });
// });

// const labels = document.querySelectorAll('.square-label');
// for (let i = 0; i < 20; i++) {
//   const label = labels[i];
//   if (i < 10) {
//     label.style.setProperty('grid-column', `${i + 2}`);
//     label.style.setProperty('grid-row', `1`);
//   } else {
//     label.style.setProperty('grid-column', '1');
//     label.style.setProperty('grid-row', `${i + 2 - 10}`);
//   }
// }

let currentShip = null;
// const body = document.querySelector('body');
// body.addEventListener('wheel', (e) => {
//   console.log('yeee');
//   if (currentShip !== null) {
//     if (currentShip.orient === 'horz') {
//       currentShip.orient = 'vert';
//     } else {
//       currentShip.orient = 'horz';
//     }
//   }
// });

const shipContainers = document.querySelectorAll('.ship-container');

shipContainers.forEach((cont) => {
  const ship = cont.querySelector('img');
  const btn = cont.querySelector('button');
  // const xInput = cont.querySelector('x-input');
  // const yInput = cont.querySelector('y-input');
  btn.addEventListener('click', (e) => {
    btn.classList.toggle('horz');
    btn.classList.toggle('vert');
    if (btn.classList.contains('horz')) {
      btn.textContent = 'Horz';
    } else {
      btn.textContent = 'Vert';
    }
    ship.classList.toggle('flipped');
    const search = '.board-' + ship.classList[0];
    const bigShip = document.querySelector(search);
    bigShip.classList.toggle('flipped');
  });
  ship.addEventListener('dragstart', (e) => {
    const search = '.board-' + ship.classList[0];
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
    };
    currentShip.bigShip.classList.add('currently-dragging');
  });
});
const hoveredSquares = [];
const placedSquares = [];
const boardSquares = document.querySelectorAll('.square');
let validPlacement = false;
for (const square of boardSquares) {
  const squareX = Number(square.classList[1].charAt(1));
  const squareY = Number(square.classList[2].charAt(1));
  square.addEventListener('dragleave', () => {
    for (let i = hoveredSquares.length; i > 0; i--) {
      const square = hoveredSquares.pop();
      square.classList.remove('is-invalid');
      square.classList.remove('is-hovered');
    }
    currentShip.bigShip.style.top = '-5000px';
  });
  square.addEventListener('dragover', (e) => {
    e.preventDefault();
    // Each square's class list is in the format: square x# y#
    if (currentShip.orient === 'horz') {
      if (squareX + currentShip.length > 10) {
        for (let i = squareX; i < 10; i++) {
          const search = `.x${i}.y${squareY}`;
          const invalidSquare = document.querySelector(search);
          invalidSquare.classList.add('is-invalid');
          hoveredSquares.push(invalidSquare);
          validPlacement = false;
        }
      } else {
        // logic for placed sections here
        const currentSquares = [];
        for (let i = 0; i < currentShip.length; i++) {
          const search = `.x${squareX + i}.y${squareY}`;
          const hoveredSquare = document.querySelector(search);
          currentSquares.push(hoveredSquare);
        }
        if (
          !placedSquares.some((arr) => {
            if (currentSquares.includes(arr[0])) return true;
          })
        ) {
          for (const hoveredSquare of currentSquares) {
            hoveredSquare.classList.add('is-hovered');
            hoveredSquares.push(hoveredSquare);
            validPlacement = true;
          }
        } else {
          for (const invalidSquare of currentSquares) {
            invalidSquare.classList.add('is-invalid');
            hoveredSquares.push(invalidSquare);
            validPlacement = false;
          }
        }
      }
    }
    if (currentShip.orient === 'vert') {
      if (squareY - currentShip.length < -1) {
        for (let i = squareY; i > -1; i--) {
          const search = `.x${squareX}.y${i}`;
          const invalidSquare = document.querySelector(search);
          invalidSquare.classList.add('is-invalid');
          hoveredSquares.push(invalidSquare);
          validPlacement = false;
        }
      } else {
        // logic for placed sections here
        const currentSquares = [];
        for (let i = 0; i < currentShip.length; i++) {
          const search = `.x${squareX}.y${squareY - i}`;
          const hoveredSquare = document.querySelector(search);
          currentSquares.push(hoveredSquare);
        }
        if (
          !placedSquares.some((arr) => {
            if (currentSquares.includes(arr[0])) return true;
          })
        ) {
          for (const hoveredSquare of currentSquares) {
            hoveredSquare.classList.add('is-hovered');
            hoveredSquares.push(hoveredSquare);
            validPlacement = true;
          }
        } else {
          for (const invalidSquare of currentSquares) {
            invalidSquare.classList.add('is-invalid');
            hoveredSquares.push(invalidSquare);
            validPlacement = false;
          }
        }
      }
    }
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
    // Need to record placement and which ships are being placed.
    // Need current ship to be remembered when moving big ships and for the program to recognize things are being moved.
    // Ships currently flip when the button horz/vert button is pressed even while placed.
    // Spinning wheel while dragging currently does not work with drop evetns.  New events may be needed instead.
    // X and Y buttons do not work.  Needs to either be removed or worked on
  });
  square.addEventListener('drop', (e) => {
    e.preventDefault();
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
    } else {
      currentShip.bigShip.style.top = '-5000px';
    }
    currentShip.bigShip.classList.remove('currently-dragging');
    currentShip = null;
  });
}

//   Then whenever you are hovering over the board, highlight the length of the ship on the board (or height).  Possibly by giving a highlighted class
// Or forcing a hovering.
// If this would highlight over x/y 9, then turn the highlight into a red highlight.
// Have a storage of already placed items.  If the highlighted items would be in the already placed items, make it glow red instead.
// If placement valid move a ship image there.
// Needs: Moving placed items again once placed
