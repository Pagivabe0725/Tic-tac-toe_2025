import { TestBed } from '@angular/core/testing';
import { Game } from './game';
import { GameLogic } from '../../services/game-logic';
import { provideZonelessChangeDetection } from '@angular/core';


/**
 * @fileoverview
 * Unit tests for the Game component.
 *
 * Tests cover:
 * - Signals: size, cells, step, and gameField
 * - setCell method: updating a cell, incrementing step, and synchronizing GameLogic.field
 * 
 * Each signal and method is verified to behave correctly with various inputs
 * and internal state changes.
 */
describe('Game', () => {
  let component: Game;
  let gameLogic: GameLogic;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Game],
      providers: [
        provideZonelessChangeDetection(),
        { provide: GameLogic, useFactory: () => new GameLogic() },
      ],
    });

    component = TestBed.createComponent(Game).componentInstance;
    gameLogic = TestBed.inject(GameLogic);
  });

  /**
   * Verify that the size signal correctly reflects the value from GameLogic
   */
  describe('size signal', () => {
    const sizes = [3, 4, 5, 6, 7, 8, 9];
    sizes.forEach((n) => {
      it(`should reflect size=${n}`, () => {
        gameLogic['size'] = n;
        expect(component['size']()).toBe(gameLogic.size());
      });
    });
  });

  /**
   * Verify that the cells signal generates the correct empty game board
   */
  describe('cells signal', () => {
    const sizes = [3, 4, 5, 6, 7, 8, 9];
    sizes.forEach((n) => {
      it(`should generate cells for size=${n}X${n}`, () => {
        gameLogic['size'] = n;
        const expectedCells = gameLogic['cells']();
        expect(component['cells']()).toEqual(expectedCells);
      });
    });
  });

  /**
   * Verify that actualMarkup signal returns correct mark ('o' or 'x') based on step
   */
  describe('step signal', () => {
    const stepCounts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    stepCounts.forEach((stepCount) => {
      it(`should return correct markup for step=${stepCount}`, () => {
        component['step'].set(stepCount);
        const expectedMarkup: 'o' | 'x' = stepCount % 2 === 0 ? 'o' : 'x';
        expect(component['actualMarkup']()).toBe(expectedMarkup);
      });
    });
  });

  /**
   * Test initialization and updates of the gameField signal
   */
  describe('gameField signal', () => {
    it('should initialize with cells from gameLogic', async () => {
      // Initialize the gameField from the cells signal
      component['gameField'].set(component['cells']());
      const expected = gameLogic['cells']();
      expect(component['gameField']()).toEqual(expected);
    });

    it('should update gameField when setCell is called', () => {
      // Initialize gameField with current cells
      const cells = component['cells']();
      component['gameField'].set(cells);

      const coord = { xCoordinate: 0, yCoordinate: 0 };
      const initialMarkup = component['actualMarkup']();
      const initialField = component['gameField']()!.map(row => [...row]);

      // Call the setCell method
      component.setCell(coord);

      const updatedField = component['gameField']()!;
      // Verify that the specific cell was updated
      expect(updatedField[coord.yCoordinate][coord.xCoordinate]).toBe(initialMarkup);

      // Verify that other cells remain unchanged
      for (let y = 0; y < initialField.length; y++) {
        for (let x = 0; x < initialField[y].length; x++) {
          if (x !== coord.xCoordinate || y !== coord.yCoordinate) {
            expect(updatedField[y][x]).toBe(initialField[y][x]);
          }
        }
      }

      // Verify that step incremented
      expect(component['step']()).toBe(1);

      // Verify that GameLogic.field was updated correctly
      expect(gameLogic.field).toEqual(updatedField);
    });
  });

  /**
   * Comprehensive test of setCell method: cell update, step increment, and GameLogic sync
   */
  describe('setCell method', () => {
    beforeEach(() => {
      // Initialize gameField from cells signal and reset step
      component['gameField'].set(component['cells']());
      component['step'].set(0);
    });

    it('should update the correct cell with actualMarkup, increment step, and sync GameLogic.field', () => {
      const coord = { xCoordinate: 1, yCoordinate: 1 };
      const initialField = component['gameField']()!.map(row => [...row]);
      const expectedMarkup = component['actualMarkup']();

      // Call setCell
      component.setCell(coord);

      const updatedField = component['gameField']()!;
      // Check the targeted cell
      expect(updatedField[coord.yCoordinate][coord.xCoordinate]).toBe(expectedMarkup);

      // Verify all other cells remain unchanged
      for (let y = 0; y < initialField.length; y++) {
        for (let x = 0; x < initialField[y].length; x++) {
          if (x !== coord.xCoordinate || y !== coord.yCoordinate) {
            expect(updatedField[y][x]).toBe(initialField[y][x]);
          }
        }
      }

      // Verify step increment
      expect(component['step']()).toBe(1);

      // Verify that GameLogic.field is updated
      expect(gameLogic.field).toEqual(updatedField);
    });
  });
});
