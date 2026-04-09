import { Ship, Gameboard, Player } from './classes';

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
    board.place(board.carrier, 0, 9, 'v');
    board.place(board.battle, 0, 0, 'h');
    board.place(board.destroy, 3, 2, 'v');
    board.place(board.sub, 3, 5, 'h');
    board.place(board.patrol, 7, 8, 'h');
    test('hits work', () => {
      expect(board.recieveAttack(0, 9)).toBe('Hit!');
      expect(board.recieveAttack(1, 9)).toBe('Miss!');
      expect(() => board.recieveAttack(1, 9)).toThrow();
    });
    test('reports sink', () => {
      board.recieveAttack(0, 8);
      board.recieveAttack(0, 7);
      board.recieveAttack(0, 6);
      expect(board.recieveAttack(0, 5)).toBe('You sunk a battleship!');
      expect(board.remainingShips).toBe(4);
    });
    test('victory works', () => {
      const smolBoard = new Gameboard();
      smolBoard.place(smolBoard.patrol, 0, 0, 'h');
      smolBoard.remainingShips = 1;
      expect(smolBoard.recieveAttack(0, 0)).toBe('Hit!');
      expect(smolBoard.recieveAttack(1, 0)).toBe("You win!  You've sunk all their ships!");
    });
  });
});
