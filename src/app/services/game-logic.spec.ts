import { TestBed } from '@angular/core/testing';
import { GameLogic } from './game-logic';
import { provideZonelessChangeDetection } from '@angular/core';

/**
 * Unit tests for the {@link GameLogic} service.
 *
 * Tests cover:
 * - Getter and setter behaviors for `size`, `field`, and `markup`
 * - Computed signals for generating the game cells array
 */
describe('GameLogic', () => {
  let service: GameLogic;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: GameLogic,
          useFactory: () => new GameLogic(),
        },
      ],
    });
    service = TestBed.inject(GameLogic);
  });

  /**
   * Tests for the public getters and setters of {@link GameLogic}.
   *
   * Verifies:
   * - The `size` signal is correctly initialized and accessible
   * - The `field` property can be set and retrieved
   * - The `markup` property can be set and retrieved
   */
  describe('Getter and setter methods', () => {
    /**
     * Tests that the default value of the {@link GameLogic#size} signal
     * is correctly set and returned by the getter.
     */
    it('Should return the current size from the #size signal', () => {
      const basicValue = 3;
      expect(service.size()).toBe(basicValue);
    });

    /**
     * Tests that the {@link GameLogic#field} property can be set and retrieved correctly.
     */
    it('Should set and get the field correctly', () => {
      const testField = [
        ['X', '', 'O'],
        ['', 'O', 'X'],
        ['O', '', 'X'],
      ];
      service.field = testField;
      expect(service.field).toEqual(testField);
    });

    /**
     * Tests that the {@link GameLogic#markup} property can be set and retrieved correctly.
     */
    it('Should set and get the markup correctly', () => {
      const testMarkup = '<div>X</div>';
      service.markup = testMarkup;
      expect(service.markup).toBe(testMarkup);
    });
  });

  /**
   * Tests for the computed {@link GameLogic#cells} signal.
   *
   * Ensures that the computed signal generates a correct empty 2D array
   * of size {@link GameLogic#size} × {@link GameLogic#size} whenever `size` changes.
   */
  describe('Signals', () => {
    /**
     * Verifies that the computed {@link GameLogic#cells} signal matches the expected
     * empty 2D array structure for board sizes ranging from 3 to 9.
     */
    it('Should compute the correct cells array for sizes 3–9', () => {
      for (const actualSize of [3, 4, 5, 6, 7, 8, 9]) {
        service.size = actualSize;
        const expectedCells = Array(actualSize)
          .fill(null)
          .map(() => Array(actualSize).fill(''));
        expect(service.cells()).toEqual(expectedCells);
      }
    });
  });
});
