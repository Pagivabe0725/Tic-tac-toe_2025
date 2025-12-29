import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { GameLogic } from '../game-logic.service';
import { Http } from '../http.service';
import { Functions } from '../functions.service';

import { AiMove } from '../../utils/interfaces/ai-move.interface';
import { LastMove } from '../../utils/types/last-move.type';

/**
 * @fileoverview
 * Unit tests for the `GameLogic` service.
 *
 * Covers:
 * - aiMove: correct endpoint, payload, retry options + hardness conversion
 * - hasWinner: correct endpoint, payload, retry options
 */

describe('GameLogic', () => {
  /** Service under test. */
  let service: GameLogic;

  /** Mocked HTTP dependency. */
  let httpMock: jasmine.SpyObj<Http>;

  /** Mocked helper functions dependency. */
  let functionsMock: jasmine.SpyObj<Functions>;

  beforeEach(() => {
    httpMock = jasmine.createSpyObj<Http>('Http', ['request']);
    functionsMock = jasmine.createSpyObj<Functions>('Functions', [
      'numberToDifficulty',
    ]);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        GameLogic,
        { provide: Http, useValue: httpMock },
        { provide: Functions, useValue: functionsMock },
      ],
    });

    service = TestBed.inject(GameLogic);
  });

  describe('[aiMove] function:', () => {
    /**
     * Ensures that `aiMove` converts hardness and forwards the correct request config.
     */
    it('Should call Http.request with converted hardness and correct retry options', async () => {
      const board = [
        ['x', '', 'o'],
        ['', 'x', ''],
        ['o', '', ''],
      ];

      const markup: 'x' | 'o' = 'o';
      const hardness = 2;

      const lastMove: LastMove = { row: 0, column: 2 };

      const apiResponse: AiMove = {
        winner: null,
        region: null,
        lastMove: { row: 2, column: 1 },
        board: [
          ['x', '', 'o'],
          ['', 'x', ''],
          ['o', 'o', ''],
        ],
      };

      functionsMock.numberToDifficulty.and.returnValue('easy' as any);
      httpMock.request.and.resolveTo(apiResponse);

      const result = await service.aiMove(board, markup, hardness, lastMove);

      expect(functionsMock.numberToDifficulty).toHaveBeenCalledOnceWith(2);

      expect(httpMock.request).toHaveBeenCalledOnceWith(
        'post',
        'game/ai-move',
        {
          board,
          markup,
          hardness: 'easy',
          lastMove,
        },
        { maxRetries: 5, initialDelay: 700 }
      );

      expect(result).toEqual(apiResponse);
    });

    /**
     * Ensures that `aiMove` returns undefined when the HTTP layer returns undefined.
     */
    it('Should return undefined when Http.request resolves undefined', async () => {
      const board = [['']];
      const lastMove: LastMove = { row: 0, column: 0 };

      functionsMock.numberToDifficulty.and.returnValue('very_easy' as any);
      httpMock.request.and.resolveTo(undefined);

      const result = await service.aiMove(board, 'x', 1, lastMove);

      expect(result).toBeUndefined();
    });
  });

  describe('[hasWinner] function:', () => {
    /**
     * Ensures that `hasWinner` forwards the board and uses correct retry options.
     */
    it('Should call Http.request with correct payload and retry options', async () => {
      const board = [
        ['x', 'x', 'x'],
        ['', 'o', ''],
        ['o', '', ''],
      ];

      const apiResponse = { winner: 'x' as const };

      httpMock.request.and.resolveTo(apiResponse);

      const result = await service.hasWinner(board);

      expect(httpMock.request).toHaveBeenCalledOnceWith(
        'post',
        'game/check-board',
        { board },
        { maxRetries: 3, initialDelay: 200 }
      );

      expect(result).toEqual(apiResponse);
    });

    /**
     * Ensures that ongoing games can return `null` winner.
     */
    it('Should handle null winner response', async () => {
      const board = [
        ['x', 'o', 'x'],
        ['o', 'x', 'o'],
        ['o', 'x', 'o'],
      ];

      const apiResponse = { winner: null };

      httpMock.request.and.resolveTo(apiResponse);

      const result = await service.hasWinner(board);

      expect(result).toEqual(apiResponse);
    });
  });
});
