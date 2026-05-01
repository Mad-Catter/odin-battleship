import { Ship, Gameboard, Player, Game } from './classes';

describe('class tests', () => {
  describe('ships are hit and die', () => {
    test('ship with 2 health dies upon 2 hits or more', () => {
      const ship2 = new Ship(2);
      ship2.hit();
      expect(ship2.isSunk()).toBe(false);
      ship2.hit();
      expect(ship2.isSunk()).toBe(true);
      ship2.hit();
      expect(ship2.isSunk()).toBe(true);
    });
    test('ship with 5 health dies upon 5 hits or more', () => {
      const ship5 = new Ship(5);
      ship5.hit();
      ship5.hit();
      ship5.hit();
      ship5.hit();
      expect(ship5.isSunk()).toBe(false);
      ship5.hit();
      expect(ship5.isSunk()).toBe(true);
    });
  });
  describe('gameboard tests', () => {
    // boat already hit to show error
    // Boats in impossible positions show error
    // Boats in overlapping show error
    // A boat does show hits properly. (and triggers the ships hit() funciton)
    const board = new Gameboard();
    board.place('carrier', 0, 9, 'v');
    board.place('battle', 0, 0, 'h');
    board.place('destroy', 3, 2, 'v');
    board.place('sub', 3, 5, 'h');
    board.place('patrol', 7, 8, 'h');
    test('hits work', () => {
      expect(board.recieveAttack(0, 9)).toEqual({ status: 'hit', ship: null });
      expect(board.recieveAttack(1, 9)).toEqual({ status: 'miss', ship: null });
      expect(() => board.recieveAttack(1, 9)).toThrow();
    });
    test('reports sink', () => {
      board.recieveAttack(0, 8);
      board.recieveAttack(0, 7);
      board.recieveAttack(0, 6);
      expect(board.recieveAttack(0, 5)).toEqual({ status: 'sunk', ship: 'carrier' });
      expect(board.remainingShips).toBe(4);
    });
    test('victory works', () => {
      const smolBoard = new Gameboard();
      smolBoard.place('patrol', 0, 0, 'h');
      smolBoard.remainingShips = 1;
      expect(smolBoard.recieveAttack(0, 0)).toEqual({ status: 'hit', ship: null });
      expect(smolBoard.recieveAttack(1, 0)).toEqual({ status: 'victory', ship: 'patrol ship' });
    });
  });
  describe.skip('computer logic tests', () => {
    const game = new Game();
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
    function setPlayerShips() {
      for (const ship of playerOneShips) {
        game.playerOne.board.place(...ship);
      }
      for (const ship of playerTwoShips) {
        game.playerTwo.board.place(...ship);
      }
    }
    setPlayerShips();
    test('priority targeting grows', () => {
      // These tests assume that the randomCoord function is changed to always return [2,2]
      expect(game.compPrioSquares.length).toBe(0);
      game.computerAttack();
      expect(game.compPrioSquares.length).toBe(4);
      console.log(game.compPrioSquares);
      if (game.computerAttack()[0].status === 'hit') {
        console.log(`hit: ${game.compPrioSquares}`);
        expect(game.compPrioSquares.length).toBe(2);
        if (game.computerAttack()[0].status === 'sunk') {
          console.log('sunk in one hit');
          expect(game.compPrioSquares.length).toBe(0);
          expect(game.compShotOrigin).toBe(null);
        } else {
          console.log('sunk in 2 hits');
          expect(game.compPrioSquares.length).toBe(1);
          expect(game.computerAttack()[0].status).toBe('sunk');
          expect(game.compPrioSquares.length).toBe(0);
          expect(game.compShotOrigin).toBe(null);
        }
      } else {
        console.log(`miss: ${game.compPrioSquares}`);
        expect(game.compPrioSquares.length).toBe(3);
        if (game.computerAttack()[0].status == { status: 'hit', ship: null }) {
          console.log(`miss into hit: ${game.compPrioSquares}`);
          expect(game.compPrioSquares.length).toBe(2);
        }
      }
    });
  });

  describe('random generation works', () => {
    function setPlayerShips() {
      for (const ship of playerOneShips) {
        game.playerOne.board.place(...ship);
      }
      for (const ship of playerTwoShips) {
        game.playerTwo.board.place(...ship);
      }
    }

    let game = new Game();
    let playerOneShips = game.generateRandomPlacements();
    let playerTwoShips = game.generateRandomPlacements();
    setPlayerShips();
    test('something', () => {
      expect(true).toBe(true);
    });
  });
});
