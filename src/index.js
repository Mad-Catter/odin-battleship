import './style.css';
import shipPlacements from './selection.js';
import './dom.js';
import { Player } from './classes.js';

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
let playerOneShips = [];
const playerTwo = new Player();
let playerTwoShips = [];
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

function regenerateBoards(playerShips) {
  for (const ship of playerOneShips) {
    const shipSearch = `.ally .${ship[0]}`;
    const bigShip = document.querySelector(shipSearch);
    const squareSearch = `ally > .x${ship[1]}.y${ship[2]}`;
    const square = document.querySelector(squareSearch);
    if (ship[3] === 'h') {
      bigShip.style.top = square.offsetTop + (ship[0] === 'carrier' || ship[0] === 'battle' ? 0 : 15) + 'px';
      bigShip.style.left =
        square.offsetLeft +
        (ship[0] === 'carrier' || ship[0] === 'battle' ? -2.5 : ship[0] === 'destroy' || ship[0] === 'sub' ? 15 : 5) +
        'px';
    } else {
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
  //   TODO add player two ships here.
}
