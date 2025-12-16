import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameHandler } from './game-handler';
import {
  InputSignal,
  provideZonelessChangeDetection,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { createGame } from '../../../utils/test/functions/creators.functions';
import { SavedGame } from '../../../utils/interfaces/saved-game.interface';
import { By } from '@angular/platform-browser';
import { Auth } from '../../../services/auth.service';
import { Http } from '../../../services/http.service';
import { Functions } from '../../../services/functions.service';
import { DialogHandler } from '../../../services/dialog-handler.service';
import { RouterService } from '../../../services/router.service';
import {
  generateRandomStatus,
  randomNumber,
} from '../../../utils/test/functions/random-values.function';
import { modifyGameSettings } from '../../../store/actions/game-settings-modify.action';
import { modifyGameInfo } from '../../../store/actions/game-info-modify.action';
import { User } from '../../../utils/interfaces/user.interface';
import { SnackBarHandler } from '../../../services/snack-bar-handler.service';

/**
 * @fileoverview
 * Unit tests focusing on the GameHandler component’s behavior, state management, and integration with services.
 *
 * The tests verify:
 * - Correct rendering of game elements based on saved games
 * - Helper methods like `calculateActualStep` compute the correct values
 * - Main component methods (`loadGame` and `deleteGame`) dispatch store actions properly
 * - Proper interaction with DialogHandler, RouterService, HttpService, and SnackBarHandler
 * - Correct handling of user actions, including both success and error scenarios
 * - Guarding behavior when user cancels actions via dialog (`CLOSE_EVENT`)
 */

describe('GameHandler', () => {
  /**
   * The GameHandler component instance under test.
   * Provides access to its methods and properties for unit testing.
   */
  let component: GameHandler;

  /**
   * Angular test fixture for the GameHandler component.
   * Allows access to the component instance, DOM elements, and triggers change detection.
   */
  let fixture: ComponentFixture<GameHandler>;

  /**
   * MockStore instance for testing NgRx store interactions and dispatched actions.
   */
  let store: MockStore;

  /**
   * Array of SavedGame objects used as input for the GameHandler component.
   * Represents the set of games being rendered and manipulated during tests.
   */
  let savedGames: SavedGame[];

  /**
   * DialogHandler service instance used to spy on dialogs and simulate user confirmations.
   */
  let dialogService: DialogHandler;

  /**
   * Helper service instance (Functions) providing utility methods used internally by the component.
   */
  let helperService: Functions;

  /**
   * RouterService instance used to verify navigation triggered by the component.
   */
  let routerService: RouterService;

  /**
   * SnackBarHandler service instance used to spy on notifications and error messages.
   */
  let snackbarService: SnackBarHandler;

  /**
   * Http service instance used to spy on network requests made by the component.
   */
  let httpService: Http;

  /**
   * Sets up the testing module, mocks services, initializes component and signals
   */
  beforeEach(async () => {
    // Create a WritableSignal for saved games
    const savedGamesSignal: WritableSignal<SavedGame[]> = signal([]);
    const randomNumber = Math.floor(Math.random() * 10) + 1;

    // Populate signal with random games
    for (let i = 0; i < randomNumber; i++) {
      savedGamesSignal.update((previous) => [
        ...previous,
        createGame(String(i), 'userId1', generateRandomStatus()),
      ]);
    }

    // Mock Auth service with a Signal for user
    const mockAuthService = {
      user: signal({
        userId: 'userId1',
        winNumber: 0,
        loseNumber: 0,
        game_count: savedGamesSignal().length,
        email: 'test@gmail.com',
      }) as Signal<User | undefined>,
    };

    savedGames = savedGamesSignal();

    // Configure the testing module with all dependencies
    await TestBed.configureTestingModule({
      imports: [GameHandler, HttpClientTestingModule, StoreModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: { gameInfo: {} } }),
        { provide: Auth, useValue: mockAuthService },
        { provide: Http, useFactory: () => new Http() },
        { provide: Functions, useFactory: () => new Functions() },
        { provide: DialogHandler, useFactory: () => new DialogHandler() },
        { provide: RouterService, useFactory: () => new RouterService() },
        { provide: SnackBarHandler, useFactory: () => new SnackBarHandler() },
      ],
    }).compileComponents();

    // Create component fixture
    fixture = TestBed.createComponent(GameHandler);
    component = fixture.componentInstance;

    // Assign savedGamesSignal to component input
    (component as any).savedGames = savedGamesSignal as unknown as InputSignal<
      SavedGame[]
    >;

    // Inject services
    store = TestBed.inject(MockStore);
    dialogService = TestBed.inject(DialogHandler);
    helperService = TestBed.inject(Functions);
    routerService = TestBed.inject(RouterService);
    httpService = TestBed.inject(Http);
    snackbarService = TestBed.inject(SnackBarHandler);

    // Spy on store.dispatch globally
    spyOn(store, 'dispatch');

    fixture.detectChanges(); // Trigger initial change detection
  });

  /**
   * HTML rendering tests
   */
  describe('HTML:', () => {
    /**
     * Verifies that the correct number of game elements are rendered
     */
    it('Should contain the correct number of `game element`', () => {
      // Query all app-game-element components
      const modules = fixture.debugElement.queryAll(
        By.css('app-game-element ')
      );
      expect(modules.length).toEqual(savedGames.length); // Should match number of saved games
    });
  });

  /**
   * Helper method tests
   */
  describe('Component helper method:', () => {
    /**
     * Verifies that calculateActualStep correctly counts non-empty fields on the board
     */
    it('[calculateActualStep] should return with the actualStep value', () => {
      for (const game of savedGames) {
        let notEmptyField = 0;
        for (let i = 0; i < game.board.length; i++) {
          for (let j = 0; j < game.board[i].length; j++) {
            if (game.board[i][j] !== '') {
              notEmptyField++; // Count non-empty fields
            }
          }
        }
        const result = component['calculateActualStep'](game.board);
        expect(result).toEqual(notEmptyField);
      }
    });
  });

  /**
   * Main component method tests
   */
  describe('Component main methods:', () => {
    /**
     * loadGame and deleteGame behavior with a valid dialog result
     */
    describe('Functions behavior with a valid dialog result:', () => {
      beforeEach(() => {
        // Mock dialog to always return true (confirmed)
        spyOn(dialogService, 'open').and.returnValue(Promise.resolve(true));
        spyOn(routerService, 'navigateTo'); // Spy router navigation
      });

      /**
       * Tests that loadGame properly dispatches store actions and navigates
       */
      it('[loadGame] should load the chosen game', async () => {
        const index = randomNumber(savedGames.length);
        const game = savedGames[index];

        // Call loadGame
        await component['loadGame'](game.gameId);

        // Verify store dispatch for game settings
        expect(store.dispatch).toHaveBeenCalledWith(
          modifyGameSettings({
            size: game.size,
            opponent: game.opponent,
            hardness: helperService.difficultyToNumber(game.difficulty),
          })
        );

        const actualStep = component['calculateActualStep'](
          savedGames[index].board
        );
        const expectedMarkup = actualStep % 2 === 0 ? 'o' : 'x';

        // Verify store dispatch for game info
        expect(store.dispatch).toHaveBeenCalledWith(
          modifyGameInfo({
            actualBoard: savedGames[index].board,
            actualStep: actualStep,
            actualMarkup: expectedMarkup,
            lastMove: savedGames[index].lastMove,
            loadedGameName: savedGames[index].name,
          })
        );

        // Verify navigation to game page
        expect(routerService.navigateTo).toHaveBeenCalledWith(['tic-tac-toe']);
      });

      /**
       * Tests that deleteGame calls the HTTP service and emits deletedGameEvent
       */
      it('[deleteGame] should delete the chosen game', async () => {
        const index = randomNumber(savedGames.length);
        const game = savedGames[index];

        const body = {
          query: `
        mutation deleteGame($gameId: ID!, $userId: ID!) {
          deleteGame(gameId: $gameId, userId: $userId) { gameId }
        }
      `,
          variables: {
            gameId: game.gameId,
            userId: game.userId,
          },
        };

        // Spy HTTP request and return mock response
        spyOn(httpService, 'request').and.returnValue(
          Promise.resolve({ data: { deleteGame: { gameId: game.gameId } } })
        );

        const emitSpy = spyOn(component.deletedGameEvent, 'emit'); // Spy event emission
        await component['deleteGame'](game.gameId);

        // Verify HTTP request call
        expect(httpService.request).toHaveBeenCalledOnceWith(
          'post',
          'graphql/game',
          body,
          { maxRetries: 3, initialDelay: 100 }
        );

        // Verify event emitted
        expect(emitSpy).toHaveBeenCalledOnceWith(game.gameId);
      });
    });

    /**
     * Tests behavior when dialog returns CLOSE_EVENT
     */
    describe('Functions behavior with a `CLOSE_EVENT` dialog result:', () => {
      beforeEach(() => {
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve('CLOSE_EVENT')
        );
      });

      /**
       * Ensures loadGame does not dispatch store actions on CLOSE_EVENT
       */
      it('[loadGame] should break execution', async () => {
        const index = randomNumber(savedGames.length);
        const game = savedGames[index];

        await component['loadGame'](game.gameId);

        // No actions should be dispatched
        expect(store.dispatch).not.toHaveBeenCalled();
      });

      /**
       * Ensures deleteGame does not dispatch store actions on CLOSE_EVENT
       */
      it('[deleteGame] should break execution', async () => {
        const index = randomNumber(savedGames.length);
        const game = savedGames[index];

        await component['deleteGame'](game.gameId);

        expect(store.dispatch).not.toHaveBeenCalled();
      });
    });

    /**
     * deleteGame error handling and snackbar notification
     */
    describe('[deleteGame] function:', () => {
      beforeEach(() => {
        spyOn(dialogService, 'open').and.returnValue(Promise.resolve(true));
        spyOn(routerService, 'navigateTo'); // Spy router
        spyOn(snackbarService, 'addElement'); // Spy snackbar
      });

      /**
       * Tests that deleteGame handles HTTP errors correctly
       * - No event emitted
       * - Snackbar shows error
       */
      it('Should handle the error properly', async () => {
        const emitSpy = spyOn(component.deletedGameEvent, 'emit');
        const index = randomNumber(savedGames.length);
        const game = savedGames[index];

        // Simulate HTTP throwing an error
        spyOn(httpService, 'request').and.throwError(new Error('Http fail'));
        await component['deleteGame'](game.gameId);

        // Validate that no event is emitted and snackbar is called
        expect(emitSpy).not.toHaveBeenCalled();
        expect(snackbarService.addElement).toHaveBeenCalledOnceWith(
          'Failed to delete game',
          true
        );
      });

      /**
       * Tests that deleteGame handles undefined data.deleteGame responses
       * - No event emitted
       */
      it('Should handle undefined `data.deleteGame` http result', async () => {
        const index = randomNumber(savedGames.length);
        const game = savedGames[index];
        const emitSpy = spyOn(component.deletedGameEvent, 'emit');

        // Simulate invalid HTTP response
        spyOn(httpService, 'request').and.returnValue(
          Promise.resolve({ errors: ['Invalid response'] })
        );

        await component['deleteGame'](game.gameId);

        expect(emitSpy).not.toHaveBeenCalled();
      });
    });
  });
});
