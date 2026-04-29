import './style.css';
import shipPlacements from './selection.js';
import { Game } from './classes.js';
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
const startingScreen = document.querySelector('.starting-screen');
const placementScreen = document.querySelector('.placement-screen');
const transitionScreen = document.querySelector('.transition-screen');
const firstTransitionText = document.querySelector('.transition-first-text');
const secondTransitionText = document.querySelector('.transition-second-text');
const playerScreen = document.querySelector('.player-screen');
const harborText = document.querySelector('.harbor>h1');
const go = document.querySelector('.go');
let playerOnePlaced = false;
let transitionRemoveable = true;

// CHANGE THIS AFTER TESTING
let vsComputer = false;

// THIS SHOULD MAYBE BE NULL AFTER TESTING
let nextScreen = playerScreen;
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

function revealScreen(screen) {
  screen.style.pointerEvents = 'auto';
  screen.style.opacity = '1';
}
function hideScreen(screen) {
  screen.style.pointerEvents = 'none';
  screen.style.opacity = '0';
}

onePlayerBtn.addEventListener('click', () => {
  vsComputer = true;
  harborText.textContent = 'Drag your ships out to sea';
  hideScreen(startingScreen);
  setTimeout(() => {
    revealScreen(placementScreen);
  }, 2000);
});
twoPlayerBtn.addEventListener('click', () => {
  vsComputer = false;
  harborText.textContent = 'Player One: \n Drag your ships out to sea';
  firstTransitionText.textContent = 'Player Two look away';
  secondTransitionText.textContent = 'Player One prepare to place your boats';
  hideScreen(startingScreen);
  setTimeout(() => {
    nextScreen = placementScreen;
    revealScreen(transitionScreen);
  }, 2000);
});
transitionScreen.addEventListener('click', () => {
  if (transitionRemoveable) {
    hideScreen(transitionScreen);
    setTimeout(() => {
      revealScreen(nextScreen);
    }, 500);
  }
});
go.addEventListener('click', () => {
  if (vsComputer) {
    playerOneShips = shipPlacements;
    hideScreen(placementScreen);
    setTimeout(() => {
      revealScreen(playerScreen);
    }, 2000);
  } else {
    if (!playerOnePlaced) {
      playerOneShips = shipPlacements;
      // CLEAR SELECTION FUNCTION HERE
      firstTransitionText.textContent = 'Player One look away';
      secondTransitionText.textContent = 'Player Two prepare to place your boats';
      revealScreen(transitionScreen);
    } else {
      playerTwoShips = shipPlacements;
      firstTransitionText.textContent = 'Player Two look away';
      secondTransitionText.textContent = 'Player One it is time for battle!';
      nextScreen = playerScreen;
      revealScreen(transitionScreen);
    }
  }
});
// Select player two > goes to transition screen telling p2 to look away > goes to harbor for p1 to place ships
//  > goes back to transition screen telling p1 to look away > goes to battle screen.  In battle screen transition shows up in between turns going back to battle
// Select player one > Goes straight to placement > then goes to battle screen.  Transition screen does not show up.
let game = new Game();

const turnPlayer = document.querySelector('.turn-player');
const turnNumber = document.querySelector('.turn-number');

const playerOneBoard = document.querySelector('.board.player-one');
const playerOneRedMiss = document.querySelector('.player-one .red-miss');
const playerOneRedHit = document.querySelector('.player-one .red-hit');
const playerTwoBoard = document.querySelector('.board.player-two');
const playerTwoRedMiss = document.querySelector('.player-two .red-miss');
const playerTwoRedHit = document.querySelector('.player-two .red-hit');

let turnCount = 1;
function setPlayerShips() {
  for (const ship of playerOneShips) {
    game.playerOne.board.place(...ship);
  }
  for (const ship of playerTwoShips) {
    game.playerTwo.board.place(...ship);
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
placeShips(playerOneBoard, playerOneShips);
placeShips(playerTwoBoard, playerTwoShips);

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
function enableBoard(player) {
  const search = player === game.playerOne ? '.player-one .square' : '.player-two .square';
  const squares = document.querySelectorAll(search);
  let response;
  for (const square of squares) {
    square.addEventListener('click', () => {
      if ((player === game.playerTwo && game.playerOneTurn) || (player === game.playerOne && !game.playerOneTurn)) {
        const squareX = Number(square.classList[1].charAt(1));
        const squareY = Number(square.classList[2].charAt(1));
        response = game.recieveAttack(player, squareX, squareY);
        visualizeShot(response, player, square);
        if (!vsComputer && response.status !== 'already shot') showTransitionScreen(response, squareX, squareY);
        if (vsComputer && response.status !== 'already shot') {
          setTimeout(() => {
            const compResult = game.computerAttack();
            const search = `.x${compResult[1][0]}.y${compResult[1][1]}`;
            const square = playerOneBoard.querySelector(search);
            visualizeShot(compResult[0], game.playerOne, square);
          }, 3000);
        }
      }
    });
  }
}
function visualizeShot(response, player, square) {
  if (response.status === 'already shot') {
    showBanner('This spot already been shot!!');
  } else {
    if (response.status === 'miss') {
      square.classList.add('square-missed');
      showBanner('A miss!!');
    } else {
      if (response.status === 'hit') {
        square.classList.add('square-hit');
        showBanner('A hit!!');
      } else if (response.status === 'victory!') {
        const board = player === game.playerOne ? playerOneBoard : playerTwoBoard;
        const allShips = board.querySelectorAll('.big-ship');
        for (const ship of allShips) {
          ship.classList.remove('hidden');
        }
        showBanner("A hit!!  You've sunk all of their battleships!");
      } else {
        showBanner(`A hit!! You sunk their ${response.ship}!`);
        const search = `.board-${response.ship === 'carrier' ? 'carrier' : response.ship === 'destroyer' ? 'destroy' : response.ship === 'battleship' ? 'battle' : response.ship === 'submarine' ? 'sub' : 'patrol'}`;
        const board = player === game.playerOne ? playerOneBoard : playerTwoBoard;
        const sunkShip = board.querySelector(search);
        sunkShip.classList.remove('hidden');
        player.sunkShips.push(sunkShip);
      }
    }
    placeNewMarker(player, square);
    turnPlayer.textContent = game.playerOneTurn ? 'Player One' : 'Player Two';
    if (game.playerOneTurn) turnNumber.textContent = `Turn ${++turnCount}`;
  }
}
enableBoard(game.playerOne);
enableBoard(game.playerTwo);

// FINISH THIS HERE
function showTransitionScreen(response, X, Y) {
  transitionRemoveable = false;
  transitionScreen.classList.add('clickable');
  playerOneBoard.classList.add('no-interaction');
  playerTwoBoard.classList.add('no-interaction');
  firstTransitionText.textContent = `Player ${!game.playerOneTurn ? 'One' : 'Two'}: look away your turn has ended!`;
  secondTransitionText.textContent = ` Player ${game.playerOneTurn ? 'One' : 'Two'}: The enemy attacked ${letters[X]}${Y + 1} and
   ${
     response.status === 'miss'
       ? 'missed!'
       : response.status === 'hit'
         ? 'hit one of our ships!'
         : response.status === 'sunk'
           ? `sunk our ${response.ship}!`
           : `sunk our ${response.ship} winning the game!`
   }`;
  setTimeout(() => {
    revealScreen(transitionScreen);
  }, 3000);
}
transitionScreen.addEventListener('transitionend', () => {
  const playerOneBigShips = playerOneBoard.querySelectorAll('.big-ship');
  for (const ship of playerOneBigShips) {
    if (game.playerOneTurn) {
      ship.classList.remove('hidden');
    } else {
      if (!game.playerOne.sunkShips.includes(ship)) {
        ship.classList.add('hidden');
      }
    }
  }
  const playerTwoBigShips = playerTwoBoard.querySelectorAll('.big-ship');
  for (const ship of playerTwoBigShips) {
    if (!game.playerOneTurn) {
      ship.classList.remove('hidden');
    } else {
      if (!game.playerTwo.sunkShips.includes(ship)) {
        ship.classList.add('hidden');
      }
    }
  }
  playerOneBoard.classList.remove('no-interaction');
  playerTwoBoard.classList.remove('no-interaction');
  transitionRemoveable = true;
  transitionScreen.classList.remove('clickable');
});
function placeNewMarker(player, square) {
  const board = player === game.playerOne ? playerOneBoard : playerTwoBoard;
  const redHit = player === game.playerOne ? playerOneRedHit : playerTwoRedHit;
  const redMiss = player === game.playerOne ? playerOneRedMiss : playerTwoRedMiss;
  if (player.lastHitSquare) {
    const lastHitX = Number(player.lastHitSquare.classList[1].charAt(1));
    const lastHitY = Number(player.lastHitSquare.classList[2].charAt(1));
    if (player.board.board[lastHitX][lastHitY] === 'X') {
      const marker = elementCreator('img', board, ['grey-miss', 'marker', 'miss-marker', 'old-marker'], {
        src: greyBall,
        alt: 'old miss marker',
      });
      marker.style.top = player.lastHitSquare.offsetTop + 10 + 'px';
      marker.style.left = player.lastHitSquare.offsetLeft + 15 + 'px';
    } else {
      const marker = elementCreator('img', board, ['grey-hit', 'marker', 'hit-marker', 'old-marker'], {
        src: greyCone,
        alt: 'old hit marker',
      });
      marker.style.top = player.lastHitSquare.offsetTop + 10 + 'px';
      marker.style.left = player.lastHitSquare.offsetLeft + 15 + 'px';
    }
  }
  const squareX = Number(square.classList[1].charAt(1));
  const squareY = Number(square.classList[2].charAt(1));
  if (player.board.board[squareX][squareY] === 'X') {
    redHit.classList.add('hidden');
    redMiss.style.top = square.offsetTop + 10 + 'px';
    redMiss.style.left = square.offsetLeft + 15 + 'px';
    redMiss.classList.remove('hidden');
  } else {
    redMiss.classList.add('hidden');
    redHit.style.top = square.offsetTop + 10 + 'px';
    redHit.style.left = square.offsetLeft + 15 + 'px';
    redHit.classList.remove('hidden');
  }
  player.lastHitSquare = square;
}
let timeoutID = false;
function showBanner(message) {
  if (timeoutID) clearTimeout(timeoutID);
  const banner = document.querySelector('.banner');
  const bannerText = document.querySelector('.banner h1');
  bannerText.textContent = message;
  banner.style.opacity = '1';
  timeoutID = setTimeout(() => {
    banner.style.opacity = '0';
  }, 3000);
  document.addEventListener('click', (e) => {
    if (e.target.closest('.board')) {
      e.stopPropagation();
    } else {
      banner.style.opacity = '0';
    }
  });
}
function resetBoard() {
  const coloredSquares = playerScreen.querySelectorAll('square-missed, .square-hit');
  for (const square of coloredSquares) {
    square.classList.remove('square-missed');
    square.classList.remove('square-hit');
  }
  const greyMarkers = playerScreen.querySelectorAll('old-marker');
  for (const marker of greyMarkers) {
    marker.remove();
  }
  const redMarkers = playerScreen.querySelectorAll('new-marker');
  for (const marker of redMarkers) {
    marker.style.top = '50000px';
  }
  const bigShips = playerScreen.querySelector('.big-ship');
  for (const bigShip of bigShips) {
    bigShip.classList.add('hidden');
  }

  // NEW GAMEBOARD AND NEW GAMEBOARD ATTATCHMENTS GO HERE

  playerOneShips = [];
  playerTwoShips = [];
  game.playerOneTurn = true;
  vsComputer = true;
  turnCount = 1;
  transitionRemoveable = true;
}

// Todo:
//   All:  Make dead ships show up slowly.  Reset game.
//  Two player: Double blind mode?
//  One Player: Computer logic, computer ship selection
