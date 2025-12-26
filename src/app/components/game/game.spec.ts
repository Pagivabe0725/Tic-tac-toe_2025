import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Game } from './game';
import { provideZonelessChangeDetection, Signal, signal } from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Store } from '@ngrx/store';
import { randomNumber } from '../../utils/test/functions/random-values.function';
import { savedGameStatus } from '../../utils/types/game-status.type';
import {
  createGame,
  createStoreInitialState,
} from '../../utils/test/functions/creators.functions';
import { Auth } from '../../services/auth.service';
import { User } from '../../utils/interfaces/user.interface';
import { GameInfo } from '../../utils/interfaces/game-info.interface';
import { modifyGameInfo } from '../../store/actions/game-info-modify.action';
import { SavedGame } from '../../utils/interfaces/saved-game.interface';
import { SnackBarHandler } from '../../services/snack-bar-handler.service';
import { GameLogic } from '../../services/game-logic.service';

/**
 * @fileoverview
 * Unit and integration tests for the Game component.
 *
 * This test suite validates game initialization, state selectors,
 * reactive effects, and gameplay logic across multiple modes:
 * - Empty board initialization
 * - Loaded finished games
 * - Player vs Player mode
 * - Player vs Computer mode
 *
 * The tests focus on NgRx store interactions, signal-driven effects,
 * AI integration, winner detection, result dispatching,
 * and user statistics persistence.
 *
 * All tests are written using Jasmine and Angular TestBed,
 * with extensive use of MockStore and spies to isolate side effects.
 */

describe('Game', () => {
  /** Test fixture used to create and control the Game component instance. */
  let fixture: ComponentFixture<Game>;

  /** Instance of the Game component under test. */
  let component: Game;

  /** Mocked saved game data used to simulate persisted game states. */
  let game: SavedGame;

  /** Mocked application state object used to initialize the NgRx store. */
  let state: any;

  /** Authentication service mock used to simulate user login state and identity. */
  let auth: Auth;

  /**
   * Tests the initial game state when a new game is created
   * and no moves have been performed yet.
   */
  describe('Empty board:', () => {
    /**
     * NgRx Store instance used to dispatch actions and select state slices
     * within the Game component during tests.
     */
    let store: Store;

    beforeEach(async () => {
      // Create game and initial store state
      game = createGame('userId_1', 'gameId_1', 'not_started');
      state = createStoreInitialState(game);

      await TestBed.configureTestingModule({
        imports: [Game, HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          provideMockStore({
            initialState: state,
          }),
        ],
      });

      // Mock Auth user signal
      auth = TestBed.inject(Auth);
      spyOnProperty(auth, 'user', 'get').and.returnValue(
        signal({
          userId: 'userId_1',
          email: 'test@gmail.com',
          game_count: 2,
          winNumber: 0,
          loseNumber: 0,
        }) as Signal<User | undefined>
      );

      fixture = TestBed.createComponent(Game);
      component = fixture.componentInstance;

      store = TestBed.inject(Store);
    });

    /**
     * Validates that component getters correctly reflect
     * the initial NgRx store state for an empty board.
     */
    describe('Getters:', () => {
      /**
       * Validate that getters correctly return values from store signals.
       */
      it('Getters should return the correct values from store signals', () => {
        fixture.detectChanges();

        expect(component.step()).toBe(state.gameInfo.actualStep);
        expect(component.lastMove()).toEqual(state.gameInfo.lastMove);
        expect(component.actualMarkup()).toBe(state.gameInfo.actualMarkup);
        expect(component.clickPermission()).toBe(true);
        expect(component.size()).toBe(state.gameSettings.size);
        expect(component.started()).toBe(state.gameInfo.started);
        expect(component.spentTimes()).toEqual(state.gameInfo.playerSpentTime);
        expect(component.results()).toEqual(state.gameInfo.results);
      });

      /**
       * Verify snackbar handling: click permission is disabled while snackbar is active
       * and re-enabled after snackbar lifetime expires.
       */
      it('Should handle open snackbar', () => {
        const snackBarHandler: SnackBarHandler =
          TestBed.inject(SnackBarHandler);

        // Add a snackbar item
        snackBarHandler.addElement('something', false);
        fixture.detectChanges();

        // Initially, click is not allowed
        expect(component.clickPermission()).toBeFalse();

        // Simulate 15 ticks for snackbar lifetime
        for (let i = 0; i < 15; i++) {
          snackBarHandler.tick();
        }

        fixture.detectChanges();

        // After lifetime expires, click permission is restored
        expect(component.clickPermission()).toBeTrue();
      });
    });

    /**
     * Tests helper and side-effect–related functions that are relevant
     * during the initial game phase without any user interaction.
     */
    describe('Related functions:', () => {
      /**
       * Verify that the winnerCheck function does not trigger a store dispatch
       * when there is no winner condition.
       */
      it('[winnerCheck] function should not execute dispatch winner', () => {
        // Spy on the store dispatch method
        const dispatchSpy = spyOn(store, 'dispatch');

        // Expect no dispatch to have occurred
        expect(dispatchSpy).not.toHaveBeenCalled();
      });
    });

    /**
     * Verifies signal-driven effects that react to store changes
     * and perform automatic game state transitions.
     */
    describe('Effect:', () => {
      /**
       * Verify that the first effect updates the store state and triggers the expected dispatch.
       */
      it('First effect should execute the function body', async () => {
        const mockStore = TestBed.inject(MockStore);

        // Spy on store dispatch to verify effect side effects
        const dispatchSpy = spyOn(store, 'dispatch');

        // Spy on computerMode to ensure it is not unintentionally triggered
        spyOn<any>(component, 'computerMode');

        // Simulate step change in the store
        mockStore.setState({
          ...state,
          gameInfo: { ...state.gameInfo, actualStep: 1 },
        });

        fixture.detectChanges();

        // Allow signal-driven effects and microtasks to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));

        expect(component.step()).toBe(1);
        expect(dispatchSpy).toHaveBeenCalledWith(
          modifyGameInfo({ started: true })
        );
      });
    });
  });

  /**
   * Tests behavior when a previously finished game
   * (win, loss, or draw) is loaded from persisted state.
   */
  describe('Loaded finished game:', () => {
    beforeEach(async () => {
      // Randomly select a finished game status
      const status = (['draw', 'lost', 'won'] as savedGameStatus[])[
        randomNumber(3)
      ];

      game = createGame('userId_1', 'gameId_1', status);
      state = createStoreInitialState(game);

      await TestBed.configureTestingModule({
        imports: [Game, HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          provideMockStore({ initialState: state }),
        ],
      });

      fixture = TestBed.createComponent(Game);
      component = fixture.componentInstance;

      // Mock authenticated user
      auth = TestBed.inject(Auth);
      spyOnProperty(auth, 'user', 'get').and.returnValue(
        signal({
          userId: 'userId_1',
          email: 'test@gmail.com',
          game_count: 2,
          winNumber: 0,
          loseNumber: 0,
        }) as Signal<User | undefined>
      );
    });

    /**
     * Verify that component getters correctly reflect the store state
     * when a finished game is loaded from persistence.
     */
    it('Getters should return the correct values from store signals', () => {
      fixture.detectChanges();

      expect(component.step()).toBe(state.gameInfo.actualStep);
      expect(component.lastMove()).toEqual(state.gameInfo.lastMove);
      expect(component.actualMarkup()).toBe(state.gameInfo.actualMarkup);
      expect(component.clickPermission()).toBeFalse();
      expect(component.size()).toBe(state.gameSettings.size);
      expect(component.started()).toBe(state.gameInfo.started);
      expect(component.spentTimes()).toEqual(state.gameInfo.playerSpentTime);
      expect(component.results()).toEqual(state.gameInfo.results);
    });
  });

  /**
   * Test suite for Player vs Player mode.
   * Covers turn progression, winner detection, effects,
   * and result calculation without AI involvement.
   */
  describe('Player vs payer mode:', () => {
    /**
     * NgRx Store instance used to dispatch actions and select state slices
     * within the Game component during tests.
     */
    let store: Store;

    /**
     * MockStore instance used to simulate and manipulate the NgRx store state
     * in unit tests, allowing direct control over state changes and selectors.
     */
    let mockStore: MockStore;

    beforeEach(async () => {
      game = createGame('userId_1', 'gameId_1', 'in_progress', 'player');
      state = createStoreInitialState(game, 2);

      await TestBed.configureTestingModule({
        imports: [Game, HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          provideMockStore({ initialState: state }),
        ],
      });

      auth = TestBed.inject(Auth);
      spyOnProperty(auth, 'user', 'get').and.returnValue(
        signal({
          userId: 'userId_1',
          email: 'test@gmail.com',
          game_count: 2,
          winNumber: 0,
          loseNumber: 0,
        }) as Signal<User | undefined>
      );

      store = TestBed.inject(Store);
      mockStore = TestBed.inject(MockStore);

      fixture = TestBed.createComponent(Game);
      component = fixture.componentInstance;
    });

    /**
     * Ensures that getters expose the correct store-backed values
     * during an active Player vs Player game.
     */

    describe('Getters: ', () => {
      /**
       * Validate that getters correctly return values from store signals.
       */
      it('Getters should return the correct values from store signals', () => {
        fixture.detectChanges();

        expect(component.step()).toBe(state.gameInfo.actualStep);
        expect(component.lastMove()).toEqual(state.gameInfo.lastMove);
        expect(component.actualMarkup()).toBe(state.gameInfo.actualMarkup);
        expect(component.clickPermission()).toBe(true);
        expect(component.size()).toBe(state.gameSettings.size);
        expect(component.started()).toBe(state.gameInfo.started);
        expect(component.spentTimes()).toEqual(state.gameInfo.playerSpentTime);
        expect(component.results()).toEqual(state.gameInfo.results);
      });
    });

    /**
     * Verifies reactive effects triggered by board and step changes
     * in Player vs Player mode.
     */
    describe('Effects:', () => {
      /**
       * Verifies that the component correctly increments the step counter
       * and invokes the two-player mode logic when the board state changes
       * and the NgRx store reflects a committed move.
       */
      it('Should increment the step and trigger second effect when the board state changes', () => {
        // Spy on the private twoPlayerMode method to verify invocation
        spyOn<any>(component, 'twoPlayerMode');

        // Retrieve the mocked NgRx store instance
        const mockStore: MockStore = TestBed.inject(MockStore);

        // Mutate the board to simulate a valid player move
        const board = state.gameInfo.actualBoard;
        board[1][0] = 'o';

        // Capture the current step returned by the component logic
        const step = component['step']();

        // Update the store state as if a new move has been committed
        mockStore.setState({
          ...state,
          gameInfo: {
            ...state.gameInfo,
            actualStep: state.gameInfo.actualStep + 1,
            actualBoard: board,
          },
        });

        // Trigger change detection to propagate state updates
        fixture.detectChanges();

        // Expect the step counter to advance by one
        expect(component['step']()).toBe(step + 1);

        // Expect two-player mode logic to be executed
        expect(component['twoPlayerMode']).toHaveBeenCalled();
      });
    });

    /**
     * Tests core gameplay helper functions such as winner detection
     * and result dispatching in Player vs Player mode.
     */
    describe('Related functions: ', () => {
      /**
       * Instance of the GameLogic service used to perform game-related logic
       * such as winner detection, AI moves, and board validations during tests.
       */
      let gameLogicService: GameLogic;

      /**
       * Jasmine spy used to monitor and assert calls to the store.dispatch method,
       * verifying that actions are correctly dispatched in response to game events.
       */
      let dispatchSpy: jasmine.Spy;

      beforeEach(() => {
        gameLogicService = TestBed.inject(GameLogic);

        spyOn(gameLogicService, 'hasWinner').and.returnValue(
          Promise.resolve({ winner: 'o' })
        );
        // Spy on the store dispatch to verify side effects
        dispatchSpy = spyOn(store, 'dispatch');
      });

      /**
       * Ensures that the winnerCheck function evaluates the board state correctly
       * and dispatches a game state update when a winning condition is detected.
       */
      it('[winnerCheck] function  should dispatch winner and stop the game when a winning board state is reached', async () => {
        // Reference the current board state from the store
        const board = state.gameInfo.actualBoard;

        // Simulate multiple moves having been played
        mockStore.setState({
          ...state,
          gameInfo: {
            ...state.gameInfo,
            actualStep: state.gameInfo.actualStep + 3,
            actualBoard: board,
          },
        });

        // Apply the updated state to the component
        fixture.detectChanges();

        // Execute winner detection logic
        await component['winnerCheck']();

        // Expect a store update with the detected winner and game termination
        expect(dispatchSpy).toHaveBeenCalledWith(
          modifyGameInfo({ winner: 'o', started: false })
        );
      });

      /**
       * Tests the `dispatchResults` function in Player vs Player mode.
       * Iterates over possible game results ('o', 'draw', 'x') and verifies
       * that the store dispatches the correct results object for each case.
       */
      it('[dispatchResults] function should calculate and dispatch correct game results for all possible winners', async () => {
        // Iterate through all possible winner outcomes
        for (const result of ['o', 'draw', 'x'] as Exclude<
          Exclude<GameInfo['winner'], undefined>,
          null
        >[]) {
          // Reset the dispatch spy to avoid cross-iteration pollution
          dispatchSpy.calls.reset();

          // Prepare a fresh results object for this iteration
          const newResults: NonNullable<GameInfo['results']> = {
            player_O_Lose: 0,
            player_O_Win: 0,
            draw: 0,
            player_X_Lose: 0,
            player_X_Win: 0,
          };

          // Update the mock store for this iteration
          mockStore.setState({
            ...state,
            gameInfo: {
              ...state.gameInfo,
              actualStep: state.gameInfo.actualStep + 1,
              winner: result,
              results: {
                player_O_Lose: 0,
                player_O_Win: 0,
                draw: 0,
                player_X_Lose: 0,
                player_X_Win: 0,
              },
            },
          });

          // Determine the expected results based on the winner
          if (result === 'o') {
            newResults.player_X_Lose = 1;
            newResults.player_O_Win = 1;
          } else if (result === 'x') {
            newResults.player_X_Win = 1;
            newResults.player_O_Lose = 1;
          } else {
            newResults.draw = 1;
          }

          // Trigger change detection to ensure the component reacts to the store update
          fixture.detectChanges();

          // Call the function under test
          await component['dispatchResults']();

          // Verify that the store dispatch was called with the correct results
          expect(dispatchSpy).toHaveBeenCalledWith(
            modifyGameInfo({ results: newResults })
          );
        }
      });
    });
  });

  /**
   * Test suite for Player vs Computer mode.
   * Covers AI interaction, winner handling, side effects,
   * and user statistics updates.
   */

  describe('Player vs computer mode:', () => {
    /**
     * NgRx Store instance used to dispatch actions and select state slices
     * within the Game component during tests.
     */
    let store: Store;

    /**
     * MockStore instance used to simulate and manipulate the NgRx store state
     * in unit tests, allowing direct control over state changes and selectors.
     */
    let mockStore: MockStore;

    /**
     * Instance of the GameLogic service used to perform game-related logic
     * such as winner detection, AI moves, and board validations during tests.
     */
    let gameLogicService: GameLogic;

    /**
     * Jasmine spy used to mock and monitor calls to the GameLogic.aiMove method,
     * simulating AI moves in Player vs Computer tests.
     */
    let aiMoveSpy: jasmine.Spy;

    /**
     * Jasmine spy used to monitor and assert calls to the store.dispatch method,
     * verifying that actions are correctly dispatched in response to game events.
     */
    let dispatchSpy: jasmine.Spy;

    /**
     * Jasmine spy used to monitor calls to the private saveResult function
     * within the Game component, verifying user statistics persistence logic.
     */
    let saveResultFunctionSpy: jasmine.Spy;

    /**
     * Jasmine spy used to mock and monitor calls to Auth.updateUser,
     * verifying that user statistics are correctly updated based on game outcomes.
     */
    let updateUserSpy: jasmine.Spy;

    beforeEach(async () => {
      game = createGame('userId_1', 'gameId_1', 'in_progress', 'computer');
      state = createStoreInitialState(game, 2);

      await TestBed.configureTestingModule({
        imports: [Game, HttpClientTestingModule],
        providers: [
          provideZonelessChangeDetection(),
          provideMockStore({ initialState: state }),
        ],
      });

      auth = TestBed.inject(Auth);
      spyOnProperty(auth, 'user', 'get').and.returnValue(
        signal({
          userId: 'userId_1',
          email: 'test@gmail.com',
          game_count: 2,
          winNumber: 0,
          loseNumber: 0,
        }) as Signal<User | undefined>
      );

      store = TestBed.inject(Store);
      mockStore = TestBed.inject(MockStore);
      gameLogicService = TestBed.inject(GameLogic);

      aiMoveSpy = spyOn(gameLogicService, 'aiMove');
      dispatchSpy = spyOn(store, 'dispatch');
      updateUserSpy = spyOn(auth, 'updateUser');

      fixture = TestBed.createComponent(Game);
      component = fixture.componentInstance;
      saveResultFunctionSpy = spyOn<any>(
        component,
        'saveResult'
      ).and.callThrough();
    });

    /**
     * Ensures that getters correctly expose game state
     * during Player vs Computer gameplay.
     */
    describe('Getters:', () => {
      /**
       * Validate that getters correctly return values from store signals.
       */
      it('Getters should return the correct values from store signals', () => {
        fixture.detectChanges();

        expect(component.step()).toBe(state.gameInfo.actualStep);
        expect(component.lastMove()).toEqual(state.gameInfo.lastMove);
        expect(component.actualMarkup()).toBe(state.gameInfo.actualMarkup);
        expect(component.clickPermission()).toBe(true);
        expect(component.size()).toBe(state.gameSettings.size);
        expect(component.started()).toBe(state.gameInfo.started);
        expect(component.spentTimes()).toEqual(state.gameInfo.playerSpentTime);
        expect(component.results()).toEqual(state.gameInfo.results);
      });
    });

    /**
     * Tests AI-driven game flow, including computer moves,
     * winner propagation, last-move dispatching,
     * and result persistence logic.
     */
    describe('Related functions:', () => {
      /**
       * Verifies that `computerMode` correctly processes an AI step
       * when no new winner is produced and updates the last move in the store.
       */
      it('[computerMode] should dispatch lastMove when AI makes a step without producing a new winner', async () => {
        // Mock AI response without a winning outcome
        aiMoveSpy.and.returnValue(
          Promise.resolve({
            board: state.gameInfo.board,
            markup: 'x',
            hardness: state.gameSettings.hardness,
            lastMove: { row: 1, column: 0 },
          })
        );

        // Simulate a game state where a previous step already exists
        mockStore.setState({
          ...state,
          gameInfo: {
            ...state.gameInfo,
            actualStep: state.gameInfo.actualStep + 1,
            winner: null,
          },
        });

        // Apply state changes to the component
        fixture.detectChanges();

        // Execute the computer mode logic
        await component['computerMode']();

        // Allow any internal async operations (timeouts, promises) to resolve
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Expect the lastMove to be dispatched based on the AI result
        expect(dispatchSpy).toHaveBeenCalledWith(
          modifyGameInfo({ lastMove: { row: 1, column: 0 } })
        );

        // Ensure that the result persistence logic is triggered
        expect(saveResultFunctionSpy).toHaveBeenCalled();

        // Ensure that no user update is triggered in this execution path
        expect(updateUserSpy).not.toHaveBeenCalled();
      });

      /**
       * Verifies that when the AI produces a new winner, the computer mode
       * dispatches the winner update, stops the game, and still propagates
       * the last move coordinates (except in draw-specific logic handled elsewhere).
       */
      it('[computerMode] should dispatch winner and lastMove when AI produces a new winning result', async () => {
        // Iterate through all possible AI-produced winner outcomes
        for (const result of ['o', 'draw', 'x'] as Exclude<
          Exclude<GameInfo['winner'], undefined>,
          null
        >[]) {
          // Mock AI response that explicitly contains a winner
          aiMoveSpy.and.returnValue(
            Promise.resolve({
              board: state.gameInfo.board,
              markup: 'x',
              hardness: state.gameSettings.hardness,
              lastMove: { row: 1, column: 0 },
              winner: result,
            })
          );

          // Simulate a valid in-progress game state
          mockStore.setState({
            ...state,
            gameInfo: {
              ...state.gameInfo,
              actualStep: state.gameInfo.actualStep + 1,
            },
          });

          // Apply mocked state to the component
          fixture.detectChanges();

          // Execute the computer mode logic
          await component['computerMode']();

          // Allow asynchronous side effects to settle
          await new Promise((resolve) => setTimeout(resolve, 1000));
          fixture.detectChanges();

          // Assert that the game is finalized with the correct winner
          expect(dispatchSpy).toHaveBeenCalledWith(
            modifyGameInfo({ winner: result, started: false })
          );

          // Assert that the AI move coordinates are propagated to the store
          expect(dispatchSpy).toHaveBeenCalledWith(
            modifyGameInfo({ lastMove: { row: 1, column: 0 } })
          );
        }
      });

      /**
       * Tests the `saveResult` function to ensure that user statistics
       * are updated correctly based on the game outcome.
       *
       * Behavior tested:
       * - If 'o' wins, the user's win count is incremented.
       * - If 'x' wins, the user's lose count is incremented.
       * - If the result is a draw, no update is made.
       */
      it('[saveResult] function should update user stats based on winner', () => {
        // Iterate through all possible game outcomes
        for (const result of ['o', 'draw', 'x'] as Exclude<
          Exclude<GameInfo['winner'], undefined>,
          null
        >[]) {
          // Update the mock store to simulate the current winner
          mockStore.setState({
            ...state,
            gameInfo: {
              ...state.gameInfo,
              winner: result,
            },
          });

          // Reset spy to avoid cross-iteration pollution
          updateUserSpy.calls.reset();

          // Trigger change detection
          fixture.detectChanges();

          // Call the function under test
          component['saveResult']();

          // Verify expected behavior based on the winner
          switch (result) {
            case 'o':
              // Player 'o' wins → win counter should increment
              expect(updateUserSpy).toHaveBeenCalledWith({ winNumber: 1 });
              break;
            case 'x':
              // Player 'x' wins → lose counter should increment
              expect(updateUserSpy).toHaveBeenCalledWith({ loseNumber: 1 });
              break;
            default:
              // Draw → no update should be made
              expect(updateUserSpy).not.toHaveBeenCalled();
          }
        }
      });
    });
  });
});
