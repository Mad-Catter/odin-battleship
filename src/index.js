import './style.css';
import shipPlacements from './selection.js';
import './dom.js';
import { Player } from './classes.js';
import elementCreator from './element-creator.js';
import greyBall from './assets/grey-ball.svg';
import greyCone from './assets/grey-cone.svg';
// From placement, an array in the form of [[ship, x, y, h/v], [ship, x, y, h/v], [ship, x, y, h/v], [ship, x, y, h/v], [ship, x, y, h/v]].
// If one player:
// Take these ships, make a new player and place all 5 ships from there.  Those ships need to end up on the player board (can probably copy placement code).

// For a computer, the placement can likely be brute force randomly placed until it works.
// The board that the player clicks on needs to be hooked up to the gameboard object, but the gameboard needs to be the authority, not the html.
// Clicking on the html board should send a hit to the gameboard and if it returns a miss place a ball on the spot.
// If a hit a cone.  Red cones and balls should be the most recent hits.  So they should be replaced with gray balls/cones on each hit.
//  (maybe save the last hit and have the comp check the js board if there is something there).
// If a ship sinks, it should be revealed on the map?

// For the computer ai, the computer can start by picking a random spot.  If it returns an error (because of it already being hit) it tries agaim.
// If it hits, add the adjacent four tiles to a preferred option

// For two players:
// Need to save two different sets of ships from selection.  So need to save selection for player1, and then clear selection and redo it.
// Then once the game begins have the same battle logic but it needs to clear and regenerate the board each turn.
// (Maybe generate all the possible cones then simply move them around the board?  Might be faster than regeneing each time.)

const onePlayerBtn = document.querySelector('.one-player-button');
const twoPlayerBtn = document.querySelector('.two-player-button');
const go = document.querySelector('.go');
const playerOne = new Player();
const playerTwo = new Player();

// Might be able to remove these
// Maybe turn these all into an object

const enemyBoard = document.querySelector('.board.enemy');
const enemyRedMiss = document.querySelector('.enemy .red-miss');

const enemyRedHit = document.querySelector('.enemy .red-hit');

const allyBoard = document.querySelector('.board.ally');

const allyRedMiss = document.querySelector('.ally .red-miss');
const allyRedHit = document.querySelector('.ally .red-hit');
// CHANGE THESE SHIPS LATER.  THIS IS FOR TESTING
let playerOneShips = [
  ['carrier', 0, 9, 'v'],
  ['battle', 0, 0, 'h'],
  ['destroy', 1, 2, 'h'],
  ['sub', 6, 5, 'v'],
  ['patrol', 9, 9, 'v'],
];

let playerTwoShips = [
  ['carrier', 0, 9, 'v'],
  ['battle', 0, 0, 'h'],
  ['destroy', 1, 2, 'h'],
  ['sub', 6, 5, 'v'],
  ['patrol', 9, 9, 'v'],
];
// ^^^^^ CHANGE THESE SHIPS LATER.  THIS IS FOR TESTING ^^^^^^^
let playerOneTurn = true;
let vsComputer = true;

onePlayerBtn.addEventListener('click', () => {
  vsComputer = true;
});

twoPlayerBtn.addEventListener('click', () => {
  vsComputer = false;
});

go.addEventListener('click', () => {
  if (vsComputer) {
    for (const ship of shipPlacements) {
      playerOne.board.place(...ship);
    }
    playerOneShips = [...shipPlacements];
    console.log(playerOne.board.board);
  }
});

function setPlayerShips() {
  for (const ship of playerOneShips) {
    playerOne.board.place(...ship);
  }
  for (const ship of playerTwoShips) {
    playerTwo.board.place(...ship);
  }
}
setPlayerShips();

function placeShips(board, ships) {
  for (const ship of ships) {
    const shipSearch = `.board-${ship[0]}`;
    const bigShip = board.querySelector(shipSearch);
    const squareSearch = `.x${ship[1]}.y${ship[2]}`;
    const square = board.querySelector(squareSearch);
    if (ship[3] === 'h') {
      bigShip.classList.remove('flipped');
      bigShip.style.top = square.offsetTop + (ship[0] === 'carrier' || ship[0] === 'battle' ? 0 : 15) + 'px';
      bigShip.style.left =
        square.offsetLeft +
        (ship[0] === 'carrier' || ship[0] === 'battle' ? -2.5 : ship[0] === 'destroy' || ship[0] === 'sub' ? 15 : 5) +
        'px';
    } else {
      bigShip.classList.add('flipped');
      bigShip.style.top =
        square.offsetTop +
        (ship[0] === 'carrier'
          ? 150
          : ship[0] === 'battle'
            ? 115
            : ship[0] === 'destroy' || ship[0] === 'sub'
              ? 90
              : 45) +
        'px';
      bigShip.style.left =
        square.offsetLeft +
        (ship[0] === 'carrier'
          ? -150
          : ship[0] === 'battle'
            ? -115
            : ship[0] === 'destroy' || ship[0] === 'sub'
              ? -65
              : -30) +
        'px';
    }
  }
}
placeShips(allyBoard, playerOneShips);
placeShips(enemyBoard, playerTwoShips);

const squares = document.querySelectorAll('.enemy .square');
for (const square of squares) {
  square.addEventListener('click', () => {
    const squareX = Number(square.classList[1].charAt(1));
    const squareY = Number(square.classList[2].charAt(1));
    const currentPlayer = playerOneTurn ? playerOne : playerTwo;
    if (currentPlayer.allShotSquares.includes(square)) {
      console.log('This has already been shot!!');
      // TODO make the banner reflect this.
    } else {
      currentPlayer.allShotSquares.push(square);
      const response = currentPlayer.board.recieveAttack(squareX, squareY);
      if (response === 'Miss!') {
        currentPlayer.missSquares.push(square);
      } else {
        currentPlayer.hitSquares.push(square);
      }
      placeMarkers(currentPlayer, square);
    }

    if (!vsComputer) playerOneTurn = !playerOneTurn;
  });
}

function placeMarkers(player, square) {
  if (player.lastHitSquare) {
    const lastHitX = Number(player.lastHitSquare.classList[1].charAt(1));
    const lastHitY = Number(player.lastHitSquare.classList[2].charAt(1));
    if (player.board.board[lastHitX][lastHitY] === 'X') {
      const marker = elementCreator('img', enemyBoard, ['grey-miss', 'marker', 'miss-marker'], {
        src: greyBall,
        alt: 'old miss marker',
      });
      marker.style.top = player.lastHitSquare.offsetTop + 10 + 'px';
      marker.style.left = player.lastHitSquare.offsetLeft + 15 + 'px';
      marker.classList.remove('hidden');
    } else {
      const marker = elementCreator('img', enemyBoard, ['grey-hit', 'marker', 'hit-marker'], {
        src: greyCone,
        alt: 'old hit marker',
      });
      marker.style.top = player.lastHitSquare.offsetTop + 10 + 'px';
      marker.style.left = player.lastHitSquare.offsetLeft + 15 + 'px';
      marker.classList.remove('hidden');
    }
  }
  const squareX = Number(square.classList[1].charAt(1));
  const squareY = Number(square.classList[2].charAt(1));
  if (player.board.board[squareX][squareY] === 'X') {
    enemyRedHit.classList.add('hidden');
    player.lastHitSquare = square;
    enemyRedMiss.style.top = square.offsetTop + 10 + 'px';
    enemyRedMiss.style.left = square.offsetLeft + 15 + 'px';
    enemyRedMiss.classList.remove('hidden');
  } else {
    enemyRedMiss.classList.add('hidden');
    player.lastHitSquare = square;
    enemyRedHit.style.top = square.offsetTop + 10 + 'px';
    enemyRedHit.style.left = square.offsetLeft + 15 + 'px';
    enemyRedHit.classList.remove('hidden');
  }
}

// Todo:
//   All: Ally board being generated. Reporting the miss, hits, or errors on the banner.
//  Two player:   Have logic for completely regenerating the board with two players. Transition screen between turns two players.
//  One Player: Computer logic.
