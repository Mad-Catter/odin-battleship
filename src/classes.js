class Ship {
  #hits = 0;
  constructor(length, name) {
    this.length = length;
    this.name = name;
  }
  hit() {
    this.#hits++;
  }
  isSunk() {
    if (this.#hits >= this.length) {
      return true;
    }
    return false;
  }
}
class Response {
  constructor(status, ship = null) {
    this.status = status;
    this.ship = ship;
  }
}
class Gameboard {
  // TODO: replacing ships.  Giving an error when trying to attack without placing all ships.
  board = [
    new Array(10),
    new Array(10),
    new Array(10),
    new Array(10),
    new Array(10),
    new Array(10),
    new Array(10),
    new Array(10),
    new Array(10),
    new Array(10),
  ];
  remainingShips = 5;
  carrier = new Ship(5, 'carrier');
  battle = new Ship(4, 'battleship');
  destroy = new Ship(3, 'destroyer');
  sub = new Ship(3, 'submarine');
  patrol = new Ship(2, 'patrol ship');

  place(shipName, xcoord, ycoord, orient) {
    const ship = this[`${shipName}`];
    const length = ship.length;
    const validPlacementCheck = () => {
      // this makes sure the whole ships space is unoccupied before placing the ship down.  This does unfortunately involve running over the sequence twice though.
      // I could maybe change this to try to save the spots in the array somehow?
      if (xcoord < 0 || xcoord > 9 || ycoord < 0 || ycoord > 9) {
        throw new Error('Ship would be out of bounds!');
      }
      if (orient === 'h') {
        if (xcoord + length - 1 > 9) {
          throw new Error('Ship would be out of bounds!');
        }
        for (let i = 0; i < length - 1; i++) {
          if (this.board[xcoord + i][ycoord] !== undefined) {
            throw new Error('This place is already taken!');
          }
        }
      } else if (orient === 'v') {
        if (ycoord - length + 1 > 9) {
          throw new Error('Ship would be out of bounds!');
        }
        for (let i = 0; i < length - 1; i++) {
          if (this.board[xcoord][ycoord - i] !== undefined) {
            throw new Error('This place is already taken!');
          }
        }
      }
    };
    validPlacementCheck();
    if (orient === 'h') {
      for (let i = 0; i < length; i++) {
        this.board[xcoord + i][ycoord] = ship;
      }
    }
    if (orient === 'v') {
      for (let i = 0; i < length; i++) {
        this.board[xcoord][ycoord - i] = ship;
      }
    }
  }
  recieveAttack(x, y) {
    if (this.board[x][y] === undefined) {
      this.board[x][y] = 'X';
      return new Response('miss');
    } else if (this.board[x][y] === 'X' || this.board[x][y] === 'O') {
      throw new Error('already shot');
    } else {
      const ship = this.board[x][y];
      this.board[x][y] = 'O';
      ship.hit();
      if (ship.isSunk()) {
        if (--this.remainingShips <= 0) {
          return new Response('victory', ship.name);
        }
        return new Response('sunk', ship.name);
      }
      return new Response('hit');
    }
  }
}
// 10x10 board, carrier(5), battleship(4), destroyer(3), submarine(3), patrol boat(2)
class Player {
  board = new Gameboard();
  // These parts are for the UI.  This should maybe be moved elsewhere.  Have the UI make its own player object but for now I think this is the most efficent path.
  sunkShips = [];
  lastHitSquare = null;
}

class Game {
  playerOne = new Player();
  playerTwo = new Player();
  playerOneTurn = true;
  swapTurn() {
    this.playerOneTurn = !this.playerOneTurn;
  }
  recieveAttack(player, X, Y) {
    let response;
    try {
      response = player.board.recieveAttack(X, Y);
    } catch {
      return new Response('already shot');
    }
    this.swapTurn();
    return response;
  }
  compShot = [];
  compPrioSquares = [];
  compShotOrigin = null;
  compSuspectedOrient = null;
  computerAttack() {
    // Computer generates a random number 0-9 for x and y.  Then shoots it.  Attacks are added to a list of already shot locations.  If the attack is in already shot locations, reroll the attack.
    // If the shot hits a ship, the four adjacent squares are added to a priority list to shoot and the original square is saved.  When shooting a priority square, it should be selected randomly from the list
    // If a priority square is shot and missed, clear that square from the list.  If it is a hit, the x and y should be compared to the origin square
    // If the x of the prio is equal to the x of the origin, clear out any squares in the prio list that have different Ys.  And vice versa if the y's are equal, clear the Xs.
    // From then on keep adding to the priority list only squares that share the same orientation and also add.
    //   If the ship gets sunk, the prioity list should be cleared (should something be done about adjacent ships next to eachother?)
    let attack;
    let response;
    const randomCoord = () => {
      // x first then y
      const coords = [Math.floor(Math.random() * 10), Math.floor(Math.random() * 10)];
      if (!this.compShot.includes(`x${coords[0]} y${coords[1]}`)) {
        return coords;
      } else {
        return randomCoord();
      }
    };
    const pushValidAdjacents = (attack) => {
      if (!this.compSuspectedOrient) {
        if (!(attack[0] - 1 < 0) && !this.compShot.includes(`x${attack[0] - 1} y${attack[1]}`)) {
          this.compPrioSquares.push([attack[0] - 1, attack[1]]);
        }
        if (!(attack[0] + 1 > 9) && !this.compShot.includes(`x${attack[0] + 1} y${attack[1]}`)) {
          this.compPrioSquares.push([attack[0] + 1, attack[1]]);
        }
        if (!(attack[1] - 1 < 0) && !this.compShot.includes(`x${attack[0]} y${attack[1] - 1}`)) {
          this.compPrioSquares.push([attack[0], attack[1] - 1]);
        }
        if (!(attack[1] + 1 > 9) && !this.compShot.includes(`x${attack[0]} y${attack[1] + 1}`)) {
          this.compPrioSquares.push([attack[0], attack[1] + 1]);
        }
      } else if (this.compSuspectedOrient === 'h') {
        if (!(attack[0] - 1 < 0) && !this.compShot.includes(`x${attack[0] - 1} y${attack[1]}`)) {
          this.compPrioSquares.push([attack[0] - 1, attack[1]]);
        }
        if (!(attack[0] + 1 > 9) && !this.compShot.includes(`x${attack[0] + 1} y${attack[1]}`)) {
          this.compPrioSquares.push([attack[0] + 1, attack[1]]);
        }
      } else {
        if (!(attack[1] - 1 < 0) && !this.compShot.includes(`x${attack[0]} y${attack[1] - 1}`)) {
          this.compPrioSquares.push([attack[0], attack[1] - 1]);
        }
        if (!(attack[1] + 1 > 9) && !this.compShot.includes(`x${attack[0]} y${attack[1] + 1}`)) {
          this.compPrioSquares.push([attack[0], attack[1] + 1]);
        }
      }
    };
    if (this.compPrioSquares.length === 0) {
      attack = randomCoord();
      response = this.playerOne.board.recieveAttack(...attack);
      if (response.status === 'hit') {
        pushValidAdjacents(attack);
        this.compShotOrigin = attack;
      }
    } else {
      const index = Math.floor(Math.random() * this.compPrioSquares.length);
      attack = this.compPrioSquares[index];
      this.compPrioSquares.splice(index, 1);
      response = this.playerOne.board.recieveAttack(...attack);
      if (response.status === 'sunk') {
        this.compPrioSquares.length = 0;
        this.compShotOrigin = null;
        this.compSuspectedOrient = null;
      } else if (response.status === 'hit') {
        if (!this.compSuspectedOrient) {
          // If the hit has the same x axis as the origin shot, then the ship must be on the x axis and therefore we want to remove any spots that have a different y axis.  Vice versa if the hit has the same y
          // DEBUG LOGIC HERE
          if (attack[0] === this.compShotOrigin[0]) {
            for (let i = this.compPrioSquares.length - 1; i > 0; i--) {
              if (this.compPrioSquares[i][0] !== this.compShotOrigin[0]) {
                this.compPrioSquares.splice(i, 1);
              }
            }
            this.compSuspectedOrient = 'v';
          } else {
            for (let i = this.compPrioSquares.length - 1; i > 0; i--) {
              if (this.compPrioSquares[i][1] !== this.compShotOrigin[1]) {
                this.compPrioSquares.splice(i, 1);
              }
            }
            this.compSuspectedOrient = 'h';
          }
        }
        pushValidAdjacents(attack);
      }
    }
    this.compShot.push(`x${attack[0]} y${attack[1]}`);
    this.swapTurn();
    return [response, attack];
  }
  generateRandomPlacements() {
    const filledSquares = [];
    function randomRange(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function generatePlacement(ship, length) {
      const orient = Math.floor(Math.random() * 2) === 0 ? 'h' : 'v';
      const potentialSquares = [];
      let randomNumber;
      if (orient === 'h') {
        randomNumber = [randomRange(0, 9 - length + 1), randomRange(0, 9)];
        for (let i = 0; i < length; i++) {
          potentialSquares.push([randomNumber[0] + i, randomNumber[1]]);
        }
      } else {
        randomNumber = [randomRange(0, 9), randomRange(length - 1, 9)];
        for (let i = 0; i < length; i++) {
          potentialSquares.push([randomNumber[0], randomNumber[1] - i]);
        }
      }
      // This could likely be done more efficently
      function arrayComparison() {
        for (let i = 0; i < potentialSquares.length; i++) {
          const firstArray = potentialSquares[i];
          for (let j = 0; j < filledSquares.length; j++) {
            const secondArray = filledSquares[j];
            if (firstArray[0] === secondArray[0] && firstArray[1] === secondArray[1]) return false;
          }
        }
        return true;
      }
      if (arrayComparison()) {
        for (const coord of potentialSquares) {
          filledSquares.push(coord);
        }
        return [ship, randomNumber[0], randomNumber[1], orient];
      } else {
        return generatePlacement(ship, length);
      }
    }
    // Have a 50/50 chance for h or v.
    // generate a number that is between x-length and 0 for h for x and 0 and y+length for v as coords.
    // Have a list of tiles taken up by the current placements.  If the current placement is already taken, regenerate numbers.
    return [
      generatePlacement('carrier', 5),
      generatePlacement('battle', 4),
      generatePlacement('destroy', 3),
      generatePlacement('sub', 3),
      generatePlacement('patrol', 2),
    ];
  }
}

export { Ship, Gameboard, Player, Game };
