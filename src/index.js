import './style.css';
import { shipPlacements, clearSelection } from './selection.js';
import { Game, generateRandomPlacements } from './classes.js';
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
const resetButton = document.querySelector('.reset');
const endScreen = document.querySelector('.end-screen');

let playerOnePlaced = false;
let transitionRemoveable = true;
let vsComputer = null;
let nextScreen = null;
let playerOneShips = [];
let playerTwoShips = [];

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

resetButton.addEventListener('click', () => {
  hideScreen(playerScreen);
  hideScreen(endScreen);
  setTimeout(() => {
    resetBoard();
    revealScreen(startingScreen);
  }, 2000);
});
// this places the ships on the board internally
function setPlayerShips() {
  for (const ship of playerOneShips) {
    game.playerOne.board.place(...ship);
  }
  for (const ship of playerTwoShips) {
    game.playerTwo.board.place(...ship);
  }
}
// This visually sets the ships on the board.
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
go.addEventListener('click', () => {
  if (vsComputer) {
    playerOneShips = [...shipPlacements];
    playerTwoShips = generateRandomPlacements();
    hideScreen(placementScreen);
    setPlayerShips();
    placeShips(playerOneBoard, playerOneShips);
    placeShips(playerTwoBoard, playerTwoShips);
    setTimeout(() => {
      revealScreen(playerScreen);
    }, 2000);
  } else {
    if (!playerOnePlaced) {
      playerOneShips = [...shipPlacements];
      firstTransitionText.textContent = 'Player One look away';
      secondTransitionText.textContent = 'Player Two prepare to place your boats';
      revealScreen(transitionScreen);
      clearSelection();
      playerOnePlaced = true;
    } else {
      playerTwoShips = [...shipPlacements];
      firstTransitionText.textContent = 'Player Two look away';
      secondTransitionText.textContent = 'Player One it is time for battle!';
      nextScreen = playerScreen;
      setPlayerShips();
      placeShips(playerOneBoard, playerOneShips);
      placeShips(playerTwoBoard, playerTwoShips);
      hideScreen(placementScreen);
      setTimeout(() => {
        revealScreen(transitionScreen);
      }, 2000);
    }
  }
});

let game = new Game();

const turnPlayer = document.querySelector('.turn-player');
const turnNumber = document.querySelector('.turn-number');
const endText = document.querySelector('.end-text');

const playerOneBoard = document.querySelector('.board.player-one');
const playerOneRedMiss = document.querySelector('.player-one .red-miss');
const playerOneRedHit = document.querySelector('.player-one .red-hit');
const playerTwoBoard = document.querySelector('.board.player-two');
const playerTwoRedMiss = document.querySelector('.player-two .red-miss');
const playerTwoRedHit = document.querySelector('.player-two .red-hit');

let turnCount = 1;

function enableBoard(player) {
  const search = player === game.playerOne ? '.player-one .square' : '.player-two .square';
  const squares = document.querySelectorAll(search);
  let response;
  // This controller is here so that the eventlistener can be canceled upon resetting the board.
  const controller = new AbortController();
  for (const square of squares) {
    square.addEventListener(
      'click',
      () => {
        // This is to make sure that each board can only be clicked on the proper turns.
        // Checking if we are facing a computer is to make sure that the user does not attack themselves on the computer's turns.
        if (
          (player === game.playerTwo && game.playerOneTurn) ||
          (player === game.playerOne && !game.playerOneTurn && !vsComputer)
        ) {
          const squareX = Number(square.classList[1].charAt(1));
          const squareY = Number(square.classList[2].charAt(1));
          response = game.recieveAttack(player, squareX, squareY);
          visualizeShot(response, player, square);
          if (response.status !== 'victory') {
            if (!vsComputer && response.status !== 'already shot') showTransitionScreen(response, squareX, squareY);
            if (vsComputer && response.status !== 'already shot') {
              // We give a delay to give the user time to see what their own attack did before thinking about what the computer did.
              setTimeout(() => {
                const compResult = game.computerAttack();
                const search = `.x${compResult[1][0]}.y${compResult[1][1]}`;
                const square = playerOneBoard.querySelector(search);
                visualizeShot(compResult[0], game.playerOne, square);
              }, 3000);
            }
          }
        }
      },
      { signal: controller.signal }
    );
  }
  return controller;
}
let playerOneController = enableBoard(game.playerOne);
let playerTwoController = enableBoard(game.playerTwo);

function visualizeShot(response, player, square) {
  if (response.status === 'already shot') {
    showBanner('This spot already been shot!!');
  } else {
    // In two player mode we can use the same message for both players as the banner will disapear between turns.
    // However, in one player mode we need another set of messages for when the computer is the one attacking the player as the user will see the banner.
    if (response.status === 'miss') {
      square.classList.add('square-missed');
      showBanner(vsComputer && game.playerOneTurn ? 'The enemy missed!!' : 'A miss!!');
    } else {
      if (response.status === 'hit') {
        showBanner(vsComputer && game.playerOneTurn ? 'The enemy hit one of our ships!!' : 'A hit!!');
      } else if (response.status === 'victory') {
        const allShips = playerScreen.querySelectorAll('.big-ship');
        for (const ship of allShips) {
          ship.classList.remove('hidden');
        }
        if (vsComputer) {
          endText.textContent = !game.playerOneTurn
            ? "We have sunk our enemy's last ship!  We won!"
            : 'Our enemy sunk our last ship!  We lost!';
        } else {
          endText.textContent = `Player ${!game.playerOneTurn ? 'One' : 'Two'} Has Won the Game!`;
        }
        revealScreen(endScreen);
      } else {
        showBanner(
          vsComputer && game.playerOneTurn
            ? `The enemy sunk our ${response.ship}!!`
            : `A hit!! You sunk their ${response.ship}!`
        );
        // If a ship is sunk, it should be revealed on the board permanently.
        const search = `.board-${response.ship === 'carrier' ? 'carrier' : response.ship === 'destroyer' ? 'destroy' : response.ship === 'battleship' ? 'battle' : response.ship === 'submarine' ? 'sub' : 'patrol'}`;
        const board = player === game.playerOne ? playerOneBoard : playerTwoBoard;
        const sunkShip = board.querySelector(search);
        sunkShip.classList.remove('hidden');
        player.sunkShips.push(sunkShip);
      }
      square.classList.add('square-hit');
    }
    placeNewMarker(player, square);
    turnPlayer.textContent = game.playerOneTurn ? 'Player One' : 'Player Two';
    if (game.playerOneTurn) turnNumber.textContent = `Turn ${++turnCount}`;
  }
}

function showTransitionScreen(response, X, Y) {
  // We dont either player to be able to click through the transition early enough to see the opponent's ships before they dissapear.
  // So we force the user to only be able to get rid of the transition once its finished and the boats have been hidden.
  transitionRemoveable = false;
  transitionScreen.classList.add('clickable');
  playerOneBoard.classList.add('no-interaction');
  playerTwoBoard.classList.add('no-interaction');
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
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
  // If this is not the first shot square, we create a gray marker (cone or ball depending on hit or miss) to the last square shot.
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
  // We move a red cone or ball (depending on hit or miss) to the square the player just shot.
  // We move around the red cone/ball since there is only the need to have 1 per player, but we create gray markers as we go on since there can be up to 99 per player.
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
  // This timeoutID is used to prevent the banner from closing early if new information comes in quickly
  // (IE the player clicks on an already shot place and then misses a shot 2 secs later)
  // (Without this code the banner would dissapear in once second from the miss, giving no real time to read the banner.)
  if (timeoutID) clearTimeout(timeoutID);
  const banner = document.querySelector('.banner');
  const bannerText = document.querySelector('.banner h1');
  bannerText.textContent = message;
  banner.style.opacity = '1';
  timeoutID = setTimeout(() => {
    banner.style.opacity = '0';
  }, 3000);
  // This is so the user can cancel the banner early, unless they are clicking on the board.
  document.addEventListener('click', (e) => {
    if (e.target.closest('.board')) {
      e.stopPropagation();
    } else {
      banner.style.opacity = '0';
    }
  });
}

function resetBoard() {
  const coloredSquares = playerScreen.querySelectorAll('.square-missed, .square-hit');
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
  const bigShips = playerScreen.querySelectorAll('.big-ship');
  for (const bigShip of bigShips) {
    bigShip.classList.add('hidden');
  }
  playerOnePlaced = false;
  transitionRemoveable = true;
  vsComputer = null;
  nextScreen = null;
  playerOneShips = [];
  playerTwoShips = [];
  turnCount = 1;
  clearSelection();

  game = new Game();
  playerOneController.abort();
  playerOneController = enableBoard(game.playerOne);
  playerTwoController.abort();
  playerTwoController = enableBoard(game.playerTwo);
}
