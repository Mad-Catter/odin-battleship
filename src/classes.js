class Ship {
  #hits = 0;
  constructor(length) {
    this.length = length;
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
  carrier = new Ship(5);
  battle = new Ship(4);
  destroy = new Ship(3);
  sub = new Ship(3);
  patrol = new Ship(2);

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
      return 'Miss!';
    } else if (this.board[x][y] === 'X' || this.board[x][y] === 'O') {
      throw new Error('This place has already been shot before!');
    } else {
      const ship = this.board[x][y];
      this.board[x][y] = 'O';
      ship.hit();
      if (ship.isSunk()) {
        if (--this.remainingShips <= 0) {
          return "You win!  You've sunk all their ships!";
        }
        return 'You sunk a battleship!';
      }
      return 'Hit!';
    }
  }
}
// 10x10 board, carrier(5), battleship(4), destroyer(3), submarine(3), patrol boat(2)
class Player {
  board = new Gameboard();
  // These parts are for the UI.  This should maybe be moved elsewhere.  Have the UI make its own player object but for now I think this is the most efficent path.
  allShotSquares = [];
  hitSquares = [];
  missSquares = [];
  lastHitSquare = null;
}

export { Ship, Gameboard, Player };
