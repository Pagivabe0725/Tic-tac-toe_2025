import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavBar } from './nav-bar';
import {
  provideZonelessChangeDetection,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  createGame,
  createGameInfo,
  createStoreInitialState,
  createUser,
} from '../../../utils/test/functions/creators.functions';
import { SavedGame } from '../../../utils/interfaces/saved-game.interface';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { RouterService } from '../../../services/router.service';
import { Auth } from '../../../services/auth.service';
import { Theme } from '../../../services/theme.service';
import {
  generateRandomGameSettingObject,
  randomBetween,
} from '../../../utils/test/functions/random-values.function';
import { DialogHandler } from '../../../services/dialog-handler.service';
import { SnackBarHandler } from '../../../services/snack-bar-handler.service';
import { Store } from '@ngrx/store';
import { getCallsArray } from '../../../utils/test/functions/helper.functions';
import { selectGameInfo } from '../../../store/selectors/game-info.selector';
import { selectGameSettings } from '../../../store/selectors/game-settings.selector';
import { GameInfo } from '../../../utils/interfaces/game-info.interface';
import { Http } from '../../../services/http.service';
import { GameSettings } from '../../../utils/interfaces/game-settings.interface';
import { Functions } from '../../../services/functions.service';

/**
 * @fileoverview
 * Unit tests for the NavBar component.
 *
 * This spec verifies navigation behavior, authentication related actions
 * (login, registration, logout), theme dependent UI changes, and game related
 * operations such as saving settings and game state.
 *
 * The tests cover both authenticated and unauthenticated user scenarios,
 * user permission handling via dialogs, HTTP request outcomes, and proper
 * snackbar feedback for success and failure cases.
 */

describe('NavBar', () => {
  /** Component instance under test */
  let component: NavBar;

  /** Angular test fixture for accessing the component instance and DOM */
  let fixture: ComponentFixture<NavBar>;

  /** Mocked saved game data used to initialize store state */
  let game: SavedGame;

  /** Initial NgRx store state used in tests */
  let state: object;

  /** Writable signal representing the current active route endpoint */
  let currentEnPoint: WritableSignal<string | undefined>;

  /** Router service used to simulate and verify navigation behavior */
  let routerService: RouterService;

  /** Authentication service used to mock login, logout, and user state */
  let authService: Auth;

  /** Theme service used to control and test theme dependent behavior */
  let themeService: Theme;

  /** Dialog handler service used to simulate user confirmations and cancellations */
  let dialogService: DialogHandler;

  /** Snackbar service used to verify user feedback messages */
  let snackbarService: SnackBarHandler;

  /** NgRx store instance used to spy on dispatched actions and selectors */
  let store: Store;

  /** Mock authenticated user used across test cases */
  let testUser = createUser(true);

  beforeEach(async () => {
    game = createGame('userId_1', 'gameId_1', 'not_started');
    state = createStoreInitialState(game);

    await TestBed.configureTestingModule({
      imports: [NavBar, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: state }),
      ],
    }).compileComponents();

    routerService = TestBed.inject(RouterService);
    authService = TestBed.inject(Auth);
    themeService = TestBed.inject(Theme);
    dialogService = TestBed.inject(DialogHandler);
    snackbarService = TestBed.inject(SnackBarHandler);
    store = TestBed.inject(Store);

    // Access the current route endpoint as a writable signal
    currentEnPoint = routerService.currentEndpoint as WritableSignal<
      string | undefined
    >;

    // Ensure no active route is set by default
    currentEnPoint.set(undefined);
  });

  /**
   * Group of tests focused on verifying the rendered HTML structure
   * and SVG icons of the NavBar component under various states.
   */
  describe('HTML:', () => {
    /**
     * Verifies that the correct set of navigation buttons is rendered
     * when no user is logged in.
     */
    it('Should render the correct buttons when no user is logged in', async () => {
      // Force light theme mode to ensure deterministic SVG rendering
      spyOnProperty(themeService, 'mode', 'get').and.returnValue('light');

      // Simulate active game route
      currentEnPoint.set('tic-tac-toe');

      fixture = TestBed.createComponent(NavBar);
      component = fixture.componentInstance;

      fixture.detectChanges();
      await fixture.whenStable();

      // Retrieve all rendered navigation buttons
      const buttons = fixture.debugElement.queryAll(By.css('button'));

      /*Expected SVG path prefixes (first 4 characters) for buttons
        visible when the user is logged out*/
      const displayedIconPathPrefixes = ['M380', 'M189', 'm370', 'M480'];

      // Validate that the number of rendered buttons matches expectations
      expect(buttons.length).toBe(displayedIconPathPrefixes.length);

      // Assert that each button contains the expected SVG path prefix
      if (displayedIconPathPrefixes.length === buttons.length) {
        for (let i = 0; i < buttons.length; i++) {
          const path = buttons[i].query(By.css('path'));
          expect(path.attributes['d']?.substring(0, 4)).toEqual(
            displayedIconPathPrefixes[i]
          );
        }
      }
    });

    /**
     * Verifies that the correct set of navigation buttons is rendered
     * when a user is logged in.
     */
    it('Should render the correct buttons when a user is logged in', async () => {
      // Simulate active game route
      currentEnPoint.set('tic-tac-toe');

      // Force light theme mode to ensure deterministic SVG rendering
      spyOnProperty(themeService, 'mode', 'get').and.returnValue('light');

      // Mock authenticated user signal
      spyOnProperty(authService, 'user').and.returnValue(signal(testUser));

      // Create component after mocking reactive dependencies
      fixture = TestBed.createComponent(NavBar);
      component = fixture.componentInstance;

      /*Expected SVG path prefixes (first 4 characters) for buttons
        visible when the user is logged in */
      const displayedIconPathPrefixes = [
        'M234',
        'M380',
        'M189',
        'M840',
        'm370',
        'M200',
      ];

      fixture.detectChanges();

      // Retrieve all rendered navigation buttons
      const buttons = fixture.debugElement.queryAll(By.css('button'));

      // Validate that the number of rendered buttons matches expectations
      expect(buttons.length).toBe(displayedIconPathPrefixes.length);

      // Assert that each button contains the expected SVG path prefix
      if (displayedIconPathPrefixes.length === buttons.length) {
        for (let i = 0; i < buttons.length; i++) {
          const path = buttons[i].query(By.css('path'));
          expect(path.attributes['d']?.substring(0, 4)).toEqual(
            displayedIconPathPrefixes[i]
          );
        }
      }
    });

    /**
     * Verifies that the correct set of navigation buttons is rendered
     * when a logged-in user navigates to the account page.
     */
    it('Should render the correct buttons on the `account` page for a logged-in user', () => {
      /* Simulate navigation to the account route */
      currentEnPoint.set('account');

      /* Force light theme to ensure deterministic SVG rendering */
      spyOnProperty(themeService, 'mode', 'get').and.returnValue('light');

      /* Mock authenticated user state */
      spyOnProperty(authService, 'user').and.returnValue(signal(testUser));

      /* Create component after mocking all reactive dependencies */
      fixture = TestBed.createComponent(NavBar);
      component = fixture.componentInstance;

      fixture.detectChanges();

      /* Expected SVG path prefixes (first 4 characters)
     for buttons visible on the account page */
      const displayedIconPathPrefixes = ['m480', 'M380', 'm370', 'M200'];

      // Query all rendered navigation buttons
      const buttons = fixture.debugElement.queryAll(By.css('button'));

      // Verify button count matches expectations
      expect(buttons.length).toBe(displayedIconPathPrefixes.length);

      // Verify each button renders the correct SVG icon
      if (displayedIconPathPrefixes.length === buttons.length) {
        for (let i = 0; i < buttons.length; i++) {
          const path = buttons[i].query(By.css('path'));
          expect(path.attributes['d']?.substring(0, 4)).toEqual(
            displayedIconPathPrefixes[i]
          );
        }
      }
    });

    /**
     * Tests that the theme toggle button displays the correct icon and
     * toggles between light and dark mode icons on each click.
     */
    it('Theme button should display the correct icon and toggle on click', async () => {
      // Simulate being on the game route
      currentEnPoint.set('tic-tac-toe');

      // Force initial theme to light
      themeService.mode = 'light';

      fixture = TestBed.createComponent(NavBar);
      component = fixture.componentInstance;

      fixture.detectChanges();

      // Pick the theme toggle button (first button in the nav bar)
      const themeButton = fixture.debugElement.queryAll(By.css('button'))[0];

      // Simulate a series of clicks and verify the SVG path toggles
      const randomNumber = randomBetween(1, 10);
      for (let i = 0; i < randomNumber; i++) {
        themeButton.triggerEventHandler('click');
        fixture.detectChanges();
        await fixture.whenStable();

        const path = themeButton.query(By.css('path')).attributes['d'];

        // Light theme icon is 'M440', dark theme icon is 'M380'
        expect(path!.substring(0, 4)).toEqual(i % 2 === 0 ? 'M440' : 'M380');
      }
    });

    /**
     * Tests that the navigation button displays the correct icon and
     * toggles its SVG path depending on the current route when clicked.
     */
    it('Navigate button should display the correct icon and toggle on click', async () => {
      /* Mock authenticated user state */
      spyOnProperty(authService, 'user').and.returnValue(signal(testUser));

      // Spy on navigateTo to update the current endpoint signal
      spyOn(routerService, 'navigateTo').and.callFake((path: string[]) => {
        currentEnPoint.set(path[0]);
      });

      // Set initial route to the game page
      currentEnPoint.set('tic-tac-toe');

      fixture = TestBed.createComponent(NavBar);
      component = fixture.componentInstance;

      fixture.detectChanges();

      // Pick the navigation button (first button in the nav bar)
      const navigateButton = fixture.debugElement.queryAll(By.css('button'))[0];

      // Simulate multiple clicks and verify the SVG path toggles
      const randomNumber = randomBetween(2, 10);
      for (let i = 0; i < randomNumber; i++) {
        navigateButton.triggerEventHandler('click');
        fixture.detectChanges();
        await fixture.whenStable();

        const path = navigateButton.query(By.css('path')).attributes['d'];

        // Expected icon prefix depending on click state: account route -> 'M234', game route -> 'm480'
        expect(path!.substring(0, 4)).toEqual(i % 2 === 0 ? 'm480' : 'M234');
      }
    });
  });

  /**
   * Test suite for verifying the behavior of NavBar component methods
   * when no user is logged in (unauthenticated state).
   */
  describe('Methods with unauthenticated user:', () => {
    let dispatchSpy: jasmine.Spy;
    beforeEach(() => {
      spyOnProperty(themeService, 'mode', 'get').and.returnValue('light');
      spyOnProperty(authService, 'user').and.returnValue(signal(undefined));
      dispatchSpy = spyOn(store, 'dispatch');
      currentEnPoint.set('tic-tac-toe');
      fixture = TestBed.createComponent(NavBar);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    /**
     * Test suite for the game settings button,
     * covering its behavior, side effects, and dispatched actions.
     */
    describe('`gameSettingsButton`:', () => {
      beforeEach(() => {
        spyOn(snackbarService, 'addElement');
      });

      /**
       * Verifies that the appropriate store actions are dispatched
       * when the user confirms the permission dialog.
       */
      it('Should dispatch the expected actions when the user grants permission', async () => {
        // Generate a valid game settings object returned by the dialog
        const gameSettings = generateRandomGameSettingObject();

        // Mock dialog confirmation with valid settings
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve(gameSettings)
        );

        // Trigger the permission-related action via button click
        const button = fixture.debugElement.queryAll(By.css('button'))[1];
        button.triggerEventHandler('click');

        fixture.detectChanges();
        await fixture.whenStable();

        // Expected dispatched actions in correct order
        const expectedCalls = [
          { ...gameSettings, type: '[gameState] modifier' },
          { type: '[gameInfo] resetter' },
        ];

        // Extract dispatched action payloads from the spy
        const calls = getCallsArray(dispatchSpy.calls.all());

        // Verify that the correct number of actions were dispatched
        expect(calls.length).toBe(expectedCalls.length);

        // Verify that each dispatched action matches expectations
        calls.forEach((call, index) => {
          expect(call).toEqual(expectedCalls[index]);
        });

        /* Verify that a success snackbar message is shown
           after the game settings are successfully saved */
        expect(snackbarService.addElement).toHaveBeenCalledWith(
          'Game settings saved',
          false
        );
      });

      /**
       * Verifies that no store actions are dispatched
       * when the user closes the permission dialog without confirmation.
       */
      it('Should not dispatch any actions when the user denies permission', async () => {
        // Mock dialog close event without confirmation
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve('CLOSE_EVENT')
        );

        // Trigger the permission-related action via button click
        const button = fixture.debugElement.queryAll(By.css('button'))[1];
        button.triggerEventHandler('click');

        fixture.detectChanges();
        await fixture.whenStable();

        // Extract dispatched actions
        const calls = getCallsArray(dispatchSpy.calls.all());

        // Ensure no actions were dispatched
        expect(calls.length).toBe(0);
        expect(dispatchSpy).not.toHaveBeenCalled();

        /* Verify that no snackbar message is shown
           when the operation is cancelled or fails */
        expect(snackbarService.addElement).not.toHaveBeenCalled();
      });
    });

    describe('`authButton`:', () => {
      beforeEach(() => {
        spyOn(snackbarService, 'addElement');
      });

      /**
       * Verifies the login flow when the user confirms the authentication dialog.
       *
       * The test covers both successful and failed login scenarios by iterating
       * over different login results, ensuring that:
       * - the Auth service is called with the provided credentials
       * - the component displays the correct snackbar feedback message
       *   depending on the login outcome
       */
      it('Should handle login when the user grants permission', async () => {
        /* Mock dialog confirmation with valid credentials */
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve({ email: 'test@gmail.com', password: '123456' })
        );

        const loginResults = [createUser(true), undefined];
        const loginSpy = spyOn(authService, 'login');

        for (const result of loginResults) {
          // Reset snackbar spy state between iterations
          (snackbarService.addElement as jasmine.Spy).calls.reset();

          loginSpy.and.returnValue(Promise.resolve(result));

          const button = fixture.debugElement.queryAll(By.css('button'))[3];
          button.triggerEventHandler('click');

          fixture.detectChanges();
          await fixture.whenStable();
          await new Promise((resolve) => setTimeout(resolve, 0));

          // Verify login was called with correct credentials
          expect(loginSpy).toHaveBeenCalledWith('test@gmail.com', '123456');

          // Verify correct feedback message based on login result
          if (result)
            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Logged in successfully',
              false
            );
          else
            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Login failed',
              true
            );
        }
      });

      /**
       * Verifies that the registration button correctly handles both successful
       * and failed registration attempts when the user grants permission.
       */
      it('Should handle both successful and failed registration when the user grants permission', async () => {
        // Mock dialog confirmation with valid registration credentials
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve({
            email: 'test@gmail.com',
            password: '123456',
            rePassword: '123456',
          })
        );

        // Simulate both successful and failed registration outcomes
        const registrationResults = [createUser(true), undefined];
        const signupSpy = spyOn(authService, 'signup');

        for (const result of registrationResults) {
          // Mock signup result for the current iteration
          signupSpy.and.returnValue(Promise.resolve(result));

          // Trigger registration via auth button
          const button = fixture.debugElement.queryAll(By.css('button'))[3];
          button.triggerEventHandler('click');

          fixture.detectChanges();
          await fixture.whenStable();
          await new Promise((resolve) => setTimeout(resolve, 0));

          // Verify signup was called with correct credentials
          expect(signupSpy).toHaveBeenCalledWith(
            'test@gmail.com',
            '123456',
            '123456'
          );

          // Verify correct feedback message based on registration result
          if (result) {
            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Registration successful',
              false
            );
          } else {
            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Registration failed',
              true
            );
          }
        }
      });

      /**
       * Verifies that no authentication or snackbar actions are triggered
       * when the dialog is closed without providing any input.
       */
      it('Should handle dialog closing without triggering actions', () => {
        // Mock dialog closing event
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve('CLOSE_EVENT')
        );

        // Spy on login and signup methods
        spyOn(authService, 'login');
        spyOn(authService, 'signup');

        // Trigger the auth button click
        const button = fixture.debugElement.queryAll(By.css('button'))[3];
        button.triggerEventHandler('click');

        // Ensure no snackbar messages or auth methods were called
        expect(snackbarService.addElement).not.toHaveBeenCalled();
        expect(authService.login).not.toHaveBeenCalled();
        expect(authService.signup).not.toHaveBeenCalled();
      });
    });

    /**
     * Test suite for the settings button functionality in the NavBar component.
     */
    describe('`settingsButton`:', () => {
      beforeEach(() => {
        spyOn(snackbarService, 'addElement');
      });

      /**
       * Verifies that when the user grants permission, the settings dialog
       * triggers the snackbar message indicating a successful update.
       */
      it('Should handle settings changing when the user grants permission', async () => {
        // Mock dialog to resolve with confirmation
        spyOn(dialogService, 'open').and.returnValue(Promise.resolve(true));

        // Trigger the settings button click
        const button = fixture.debugElement.queryAll(By.css('button'))[2];
        button.triggerEventHandler('click');

        fixture.detectChanges();
        await fixture.whenStable();

        // Verify snackbar message
        expect(snackbarService.addElement).toHaveBeenCalledWith(
          'Settings updated',
          false
        );
      });

      /**
       * Verifies that closing the settings dialog without confirming
       * does not trigger any snackbar messages.
       */
      it('Should handle dialog closing without triggering actions', async () => {
        // Mock dialog to resolve with close event
        spyOn(dialogService, 'open').and.returnValue(
          Promise.resolve('CLOSE_EVENT')
        );

        // Trigger the settings button click
        const button = fixture.debugElement.queryAll(By.css('button'))[2];
        button.triggerEventHandler('click');

        fixture.detectChanges();
        await fixture.whenStable();

        // Ensure snackbar is not called
        expect(snackbarService.addElement).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * Test suite covering component methods that are available
   * when an authenticated user is present.
   * Assumes an active route and a fixed theme mode.
   */
  describe('Methods with authenticated user:', () => {
    let dispatchSpy: jasmine.Spy;

    beforeEach(() => {
      // Force light theme for deterministic icon rendering
      spyOnProperty(themeService, 'mode', 'get').and.returnValue('light');

      // Mock authenticated user state
      spyOnProperty(authService, 'user').and.returnValue(signal(testUser));

      // Spy on store dispatch to verify triggered actions
      dispatchSpy = spyOn(store, 'dispatch');

      // Simulate active game route
      currentEnPoint.set('tic-tac-toe');

      fixture = TestBed.createComponent(NavBar);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    /**
     * Test suite for the save button behavior.
     * Covers successful save flows based on game state and backend responses.
     */
    describe('`saveButton`:', () => {
      let httpService: Http;
      let requestSpy: jasmine.Spy;

      beforeEach(() => {
        httpService = TestBed.inject(Http);

        // Spy on snackbar to verify user feedback messages
        spyOn(snackbarService, 'addElement');

        // Spy on HTTP request method to inspect outgoing save requests
        requestSpy = spyOn(httpService, 'request');
      });

      /**
       * Tests covering scenarios where the user confirms the save dialog.
       */
      describe('User grants permission:', () => {
        /** Mocked game information used to simulate current game state */
        let gameInfo: GameInfo;

        /** Mocked game settings used to simulate active configuration */
        let gameSettings: GameSettings;

        /** Spy for the NgRx `selectSignal` method to control selector outputs */
        let selectSignalSpy: jasmine.Spy;

        /** Helper service used for difficulty conversion and related utilities */
        let helperService: Functions;

        /** Expected HTTP request body sent when saving a game */
        let body: any;

        beforeEach(() => {
          helperService = TestBed.inject(Functions);

          // Prepare base game state and settings
          gameInfo = createGameInfo();
          gameSettings = generateRandomGameSettingObject();

          // Mock dialog confirmation with a valid game name
          spyOn(dialogService, 'open').and.returnValue(
            Promise.resolve({ gameName: gameInfo.loadedGameName })
          );

          // Spy on store signal selection to control emitted state
          selectSignalSpy = spyOn(store, 'selectSignal');

          // Mock successful backend response
          requestSpy.and.returnValue(
            Promise.resolve({ userId: testUser.userId })
          );

          // Base request body shared across save scenarios
          body = {
            userId: testUser.userId,
            name: gameInfo.loadedGameName,
            board: gameInfo.actualBoard,
            lastMove: gameInfo.lastMove,
            status: 'not_started',
            difficulty: helperService.numberToDifficulty(gameSettings.hardness),
            opponent: gameSettings.opponent,
            size: gameSettings.size,
          };
        });

        /**
         * Tests covering valid HTTP responses from the backend.
         */
        describe('With valid HTTP response:', () => {
          // Iterate through all possible winner states
          for (const winner of [
            'x',
            'o',
            'draw',
            null,
          ] as GameInfo['winner'][]) {
            it(`should save the finished game with winner '${winner}'`, async () => {
              // Mock store signals for game info and settings
              selectSignalSpy.and.callFake(((selector: any) => {
                switch (selector) {
                  case selectGameInfo:
                    return signal({ ...gameInfo, winner });
                  case selectGameSettings:
                    return signal(gameSettings);
                  default:
                    return signal(undefined);
                }
              }) as typeof store.selectSignal);

              // Derive game status from winner
              switch (winner) {
                case 'o':
                  body.status = 'won';
                  break;
                case 'x':
                  body.status = 'lost';
                  break;
                case 'draw':
                  body.status = 'draw';
              }

              const button = fixture.debugElement.queryAll(By.css('button'))[3];
              button.triggerEventHandler('click');

              fixture.detectChanges();
              await fixture.whenStable();
              await new Promise((response) => setTimeout(response, 0));

              // Verify user feedback
              expect(snackbarService.addElement).toHaveBeenCalledWith(
                'Game saved successfully',
                false
              );

              // Verify HTTP request only when a winner exists
              if (winner) {
                expect(requestSpy).toHaveBeenCalledWith(
                  'post',
                  'game/create-game',
                  body,
                  { maxRetries: 3, initialDelay: 100 }
                );
              }
            });

            // Additional checks for ongoing games without a winner
            if (!winner)
              for (const actualStep of [undefined, 0, randomBetween(1, 81)]) {
                it(`should save the game when there is no winner and actualStep is ${actualStep}`, async () => {
                  selectSignalSpy.and.callFake(((selector: any) => {
                    switch (selector) {
                      case selectGameInfo:
                        return signal({ ...gameInfo, winner, actualStep });
                      case selectGameSettings:
                        return signal(gameSettings);
                      default:
                        return signal(undefined);
                    }
                  }) as typeof store.selectSignal);

                  // Determine game status based on progress
                  switch (actualStep) {
                    case undefined:
                    case 0:
                      body.status = 'not_started';
                      break;
                    default:
                      body.status = 'in_progress';
                  }

                  const button = fixture.debugElement.queryAll(
                    By.css('button')
                  )[3];
                  button.triggerEventHandler('click');

                  fixture.detectChanges();
                  await fixture.whenStable();
                  await new Promise((response) => setTimeout(response, 0));

                  // Verify user feedback and backend request
                  expect(snackbarService.addElement).toHaveBeenCalledWith(
                    'Game saved successfully',
                    false
                  );
                  expect(requestSpy).toHaveBeenCalledWith(
                    'post',
                    'game/create-game',
                    body,
                    { maxRetries: 3, initialDelay: 100 }
                  );
                });
              }
          }
        });

        /**
         * Covers error-handling scenarios when the save-game HTTP request
         * does not return a valid response or fails during execution.
         */
        describe('With invalid HTTP response:', () => {
          /**
           * Displays an error snackbar when the save request returns a response
           * without a valid userId, indicating that the game could not be saved.
           */
          it('displays an error snackbar when the response does not contain a userId', async () => {
            // Simulate a successful HTTP request with an invalid logical response
            requestSpy.and.returnValue(Promise.resolve({ userId: undefined }));

            // Provide valid game and settings state via store signals
            selectSignalSpy.and.callFake(((selector: any) => {
              switch (selector) {
                case selectGameInfo:
                  return signal({ ...gameInfo });
                case selectGameSettings:
                  return signal(gameSettings);
                default:
                  return signal(undefined);
              }
            }) as typeof store.selectSignal);

            // Trigger save action
            const button = fixture.debugElement.queryAll(By.css('button'))[3];
            button.triggerEventHandler('click');

            fixture.detectChanges();
            await fixture.whenStable();
            await new Promise((response) => setTimeout(response, 0));

            // Verify the save request was attempted
            expect(requestSpy).toHaveBeenCalledWith(
              'post',
              'game/create-game',
              body,
              { maxRetries: 3, initialDelay: 100 }
            );

            // Verify error feedback is shown to the user
            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Game saving failed',
              true
            );
          });

          /**
           * Displays an error snackbar when the save request throws an exception,
           * simulating network or server-side failure during game saving.
           */
          it('displays an error snackbar when the save request throws an error', async () => {
            // Simulate a network or server-side error
            requestSpy.and.throwError(new Error('Invalid request'));

            // Provide valid game and settings state via store signals
            selectSignalSpy.and.callFake(((selector: any) => {
              switch (selector) {
                case selectGameInfo:
                  return signal({ ...gameInfo });
                case selectGameSettings:
                  return signal(gameSettings);
                default:
                  return signal(undefined);
              }
            }) as typeof store.selectSignal);

            // Trigger save action
            const button = fixture.debugElement.queryAll(By.css('button'))[3];
            button.triggerEventHandler('click');

            fixture.detectChanges();
            await fixture.whenStable();
            await new Promise((response) => setTimeout(response, 0));

            // Verify the save request was attempted despite the error
            expect(requestSpy).toHaveBeenCalledWith(
              'post',
              'game/create-game',
              body,
              { maxRetries: 3, initialDelay: 100 }
            );

            // Verify error feedback is shown to the user
            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Game saving failed',
              true
            );
          });
        });
      });

      /**
       * Tests the behavior when the user denies permission in the dialog.
       * Ensures that no actions are triggered, such as HTTP requests or snackbar notifications.
       */
      describe('User denies permission:', () => {
        /**
         * Verifies that if the user closes the dialog without granting permission,
         * no HTTP request is sent and no snackbar message is displayed.
         */
        it('Should close the dialog without executing any actions', async () => {
          // Mock dialog closure event
          spyOn(dialogService, 'open').and.returnValue(
            Promise.resolve('CLOSE_EVENT')
          );

          const button = fixture.debugElement.queryAll(By.css('button'))[3];
          button.triggerEventHandler('click');

          fixture.detectChanges();
          await fixture.whenStable();
          await new Promise((resolve) => setTimeout(resolve, 0));

          // Verify that no HTTP request was made
          expect(requestSpy).not.toHaveBeenCalled();

          // Verify that no snackbar notification was shown
          expect(snackbarService.addElement).not.toHaveBeenCalled();
        });
      });
    });

    /**
     * Tests the behavior of the logout button in the NavBar component.
     * Ensures that clicking the button logs out the user when permission is granted.
     */
    describe('`logoutButton`:', () => {
      /** Spy for the authentication service logout method */
      let logoutSpy: jasmine.Spy;

      beforeEach(() => {
        logoutSpy = spyOn(authService, 'logout');
        spyOn(snackbarService, 'addElement');
      });

      /**
       * Tests covering scenarios where the user confirms the logout dialog.
       */
      describe('User grants permission:', () => {
        /**
         * Tests covering valid HTTP responses from the backend.
         */
        describe('With valid HTTP response:', () => {
          /**
           * Verifies that the logout action is triggered when the user grants permission.
           */
          it('Should log out the user when permission is granted', async () => {
            // Mock dialog confirmation to simulate user granting permission
            spyOn(dialogService, 'open').and.returnValue(Promise.resolve(true));

            // Mock logout service to simulate successful logout
            logoutSpy.and.returnValue(Promise.resolve(true));

            // Get the logout button from the component
            const button = fixture.debugElement.queryAll(By.css('button'))[5];

            // Trigger the click event on the logout button
            button.triggerEventHandler('click');

            // Update the component and wait for asynchronous operations
            fixture.detectChanges();
            await fixture.whenStable();
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Expected dispatch actions after logout
            const expectations: any[] = [
              {
                opponent: 'player',
                type: '[gameState] modifier',
              },
              {
                type: '[gameInfo] result resetter',
              },
              {
                type: '[gameInfo] resetter',
              },
            ];

            // Verify that each dispatched action matches the expected sequence
            getCallsArray(dispatchSpy.calls.all()).forEach((call, index) => {
              expect(call).toEqual(expectations[index]);
            });

            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Logged out successfully',
              false
            );
          });
        });

        /**
         * Covers error-handling scenarios when the logout HTTP request
         * does not return a valid response or fails during execution.
         */
        describe('With invalid HTTP response:', () => {
          /**
           * Verifies that a snackbar error is displayed when the logout function returns an invalid value.
           */
          it('Should display a snackbar error when logout return with invalid value ', async () => {
            // Mock dialog confirmation to simulate user granting permission
            spyOn(dialogService, 'open').and.returnValue(Promise.resolve(true));

            // Mock logout service to simulate failed logout
            logoutSpy.and.returnValue(Promise.resolve(false));

            // Get the logout button from the component
            const button = fixture.debugElement.queryAll(By.css('button'))[5];

            // Trigger the click event on the logout button
            button.triggerEventHandler('click');

            // Update the component and wait for asynchronous operations
            fixture.detectChanges();
            await fixture.whenStable();
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Ensure no actions were dispatched since logout failed
            const dispatchCalls = getCallsArray(dispatchSpy.calls.all());
            expect(dispatchCalls.length).toBe(0);

            // Verify that a snackbar error message is displayed
            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Logout failed',
              true
            );
          });

          /**
           * Verifies that an error snackbar is shown when the logout process fails
           * due to an exception thrown by the logout service.
           */
          it('Should displyay a snackbar error ehen logout failed', async () => {
            // Mock dialog confirmation to simulate user granting permission
            spyOn(dialogService, 'open').and.returnValue(Promise.resolve(true));

            // Mock logout service to simulate failed logout
            logoutSpy.and.throwError(new Error('Invalid response'));

            // Get the logout button from the component
            const button = fixture.debugElement.queryAll(By.css('button'))[5];

            // Trigger the click event on the logout button
            button.triggerEventHandler('click');

            // Update the component and wait for asynchronous operations
            fixture.detectChanges();
            await fixture.whenStable();
            await new Promise((resolve) => setTimeout(resolve, 0));

            // Ensure no actions were dispatched since logout failed
            const dispatchCalls = getCallsArray(dispatchSpy.calls.all());
            expect(dispatchCalls.length).toBe(0);

            // Verify that a snackbar error message is displayed
            expect(snackbarService.addElement).toHaveBeenCalledWith(
              'Logout failed',
              true
            );
          });
        });
      });

      /**
       * Tests the behavior when the user denies permission in the dialog.
       * Ensures that no actions are triggered, such as HTTP requests or snackbar notifications.
       */
      describe('User denies permission:', () => {
        /**
         * Verifies that closing the dialog does not trigger any side effects,
         * such as HTTP requests or snackbar notifications.
         */
        it('should close the dialog without executing any actions', async () => {
          // Mock dialog closure event
          spyOn(dialogService, 'open').and.returnValue(
            Promise.resolve('CLOSE_EVENT')
          );

          // Inject HTTP service and spy on the request method
          const httpService = TestBed.inject(Http);
          const requestSpy = spyOn(httpService, 'request');

          // Trigger click on the related action button
          const button = fixture.debugElement.queryAll(By.css('button'))[3];
          button.triggerEventHandler('click');

          // Run change detection and wait for async side effects
          fixture.detectChanges();
          await fixture.whenStable();
          await new Promise((resolve) => setTimeout(resolve, 0));

          // Verify that no HTTP request was made
          expect(requestSpy).not.toHaveBeenCalled();

          // Verify that no snackbar notification was shown
          expect(snackbarService.addElement).not.toHaveBeenCalled();
        });
      });
    });

    describe('`navigationButton`:', () => {
      /** Spy for the router service `navigateTo` method */
      let navigateToSpy: jasmine.Spy;

      beforeEach(() => {
        navigateToSpy = spyOn(routerService, 'navigateTo');
        spyOn(snackbarService, 'addElement');
      });

      /**
       * Verifies that clicking the navigation button triggers a route change
       * to the account page with the expected query parameters and merge strategy.
       */
      it('Should navigate to the `account` page when the navigation button is clicked', () => {
        // Get the account navigation button
        const button = fixture.debugElement.queryAll(By.css('button'))[0];

        // Trigger click event to initiate navigation
        button.triggerEventHandler('click');

        // Verify that navigation was called with the correct arguments
        expect(navigateToSpy).toHaveBeenCalledWith(
          ['account'],
          { page: 1, order: 'time-desc' },
          'merge'
        );
      });

      /**
       * Verifies that clicking the navigation button navigates back
       * to the main game page when the user is currently on the account page.
       */
      it('Should navigate back to the main page when clicked from the account page', () => {
        // Simulate that the current route is the account page
        currentEnPoint.set('account');

        // Apply state changes
        fixture.detectChanges();

        // Get the main navigation button
        const button = fixture.debugElement.queryAll(By.css('button'))[0];

        // Trigger click event to initiate navigation
        button.triggerEventHandler('click');

        // Verify that navigation was called with the correct arguments
        expect(navigateToSpy).toHaveBeenCalledWith(
          ['tic-tac-toe'],
          { page: null, filter: null, order: null },
          'merge'
        );
      });
    });
  });
});
