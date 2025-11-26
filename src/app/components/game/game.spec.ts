/* 
import { TestBed } from '@angular/core/testing';
import { Game } from './game';
import { GameLogic } from '../../services/game-logic.service';
import { provideZonelessChangeDetection } from '@angular/core';



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


  describe('size signal', () => {
    const sizes = [3, 4, 5, 6, 7, 8, 9];
    sizes.forEach((n) => {
      it(`should reflect size=${n}`, () => {
        gameLogic['size'] = n;
        expect(component['size']()).toBe(gameLogic.size());
      });
    });
  });


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


  describe('gameField signal', () => {
    it('should initialize with cells from gameLogic', async () => {
      // Initialize the gameField from the cells signal
      component['gameField'].set(component['cells']());
      const expected = gameLogic['cells']();
      expect(component['gameField']()).toEqual(expected);
    });

    it('should update gameField when setCell is called', () => {

      const cells = component['cells']();
      component['gameField'].set(cells);

      const coord = { xCoordinate: 0, yCoordinate: 0 };
      const initialMarkup = component['actualMarkup']();
      const initialField = component['gameField']()!.map(row => [...row]);

  
      component.setCell(coord);

      const updatedField = component['gameField']()!;

      expect(updatedField[coord.yCoordinate][coord.xCoordinate]).toBe(initialMarkup);


      for (let y = 0; y < initialField.length; y++) {
        for (let x = 0; x < initialField[y].length; x++) {
          if (x !== coord.xCoordinate || y !== coord.yCoordinate) {
            expect(updatedField[y][x]).toBe(initialField[y][x]);
          }
        }
      }


      expect(component['step']()).toBe(1);

   
      expect(gameLogic.field).toEqual(updatedField);
    });
  });


  describe('setCell method', () => {
    beforeEach(() => {

      component['gameField'].set(component['cells']());
      component['step'].set(0);
    });

    it('should update the correct cell with actualMarkup, increment step, and sync GameLogic.field', () => {
      const coord = { xCoordinate: 1, yCoordinate: 1 };
      const initialField = component['gameField']()!.map(row => [...row]);
      const expectedMarkup = component['actualMarkup']();


      component.setCell(coord);

      const updatedField = component['gameField']()!;

      expect(updatedField[coord.yCoordinate][coord.xCoordinate]).toBe(expectedMarkup);

      for (let y = 0; y < initialField.length; y++) {
        for (let x = 0; x < initialField[y].length; x++) {
          if (x !== coord.xCoordinate || y !== coord.yCoordinate) {
            expect(updatedField[y][x]).toBe(initialField[y][x]);
          }
        }
      }


      expect(component['step']()).toBe(1);

      expect(gameLogic.field).toEqual(updatedField);
    });
  });
});

 */