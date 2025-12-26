import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDisplayPart } from './game-display-part';
import {
  InputSignal,
  provideZonelessChangeDetection,
  signal,
  WritableSignal,
} from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { createGameInfo } from '../../../utils/test/functions/creators.functions';
import { GameInfo } from '../../../utils/interfaces/game-info.interface';
import { LastMove } from '../../../utils/types/last-move.type';
import { Store } from '@ngrx/store';
import { selectPlayersSpentTimes } from '../../../store/selectors/game-info.selector';
import { By } from '@angular/platform-browser';
import { randomBetween } from '../../../utils/test/functions/random-values.function';
import { Theme } from '../../../services/theme.service';
import { modifyGameInfo } from '../../../store/actions/game-info-modify.action';

describe('GameDisplayPart', () => {
  /**
   * Component instance under test.
   */
  let component: GameDisplayPart;

  /**
   * Angular test fixture used to access the component instance,
   * trigger change detection, and interact with the rendered DOM.
   */
  let fixture: ComponentFixture<GameDisplayPart>;

  /**
   * Mocked game state object used as input and store data source
   * for testing component behavior.
   */
  let gameInfo: GameInfo = createGameInfo();

  /**
   * Injected NgRx Store instance, spied on in tests to verify
   * that actions are correctly dispatched in response to component events.
   */
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameDisplayPart],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: {} }),
      ],
    }).compileComponents();

    store = TestBed.inject(Store);

    spyOn(store, 'selectSignal').and.callFake(((selector: any) => {
      switch (selector) {
        case selectPlayersSpentTimes:
          return signal(gameInfo.playerSpentTime);
        default:
          return signal(undefined);
      }
    }) as typeof store.selectSignal);

    fixture = TestBed.createComponent(GameDisplayPart);
    component = fixture.componentInstance;

    component['actualMarkup'] = signal(
      gameInfo.actualMarkup
    ) as unknown as InputSignal<GameInfo['actualMarkup']>;

    component['lastMove'] = signal(gameInfo.lastMove) as unknown as InputSignal<
      LastMove | undefined
    >;

    component['started'] = signal(gameInfo.started) as unknown as InputSignal<
      GameInfo['started']
    >;

    component['results'] = signal(gameInfo.results) as unknown as InputSignal<
      GameInfo['results']
    >;

    component['spentTimes'] = signal(
      gameInfo.playerSpentTime
    ) as unknown as InputSignal<GameInfo['playerSpentTime']>;

    component.markup = 'o';

    fixture.detectChanges();
  });

  /**
   * HTML rendering tests for the GameDisplayPart component.
   */
  describe('HTML:', () => {
    /**
     * Verifies that the correct result values are rendered in the HTML
     * depending on the active player markup ('x' or 'o').
     *
     * The test iterates through both players and checks:
     * - the number of rendered result spans
     * - the textual content of each result span
     *
     * This ensures that the UI reacts correctly to markup changes.
     */
    it('Should render correct result values for both players based on active markup', async () => {
      /**
       * All possible player markups.
       */
      const players: Exclude<GameInfo['actualMarkup'], undefined>[] = [
        'o',
        'x',
      ];

      // Cast the component's results signal to a WritableSignal so it can be updated in tests
      const resultSignal = component.results as unknown as WritableSignal<
        GameInfo['results']
      >;

      // Update the results signal with the current gameInfo results, simulating a state change
      resultSignal.set({ ...gameInfo.results });

      //Expected result values when player 'X' is active.
      const player_X_results = [
        gameInfo.results?.player_X_Win,
        gameInfo.results?.player_X_Lose,
        gameInfo.results?.draw,
      ];

      //Expected result values when player 'O' is active.
      const player_O_results = [
        gameInfo.results?.player_O_Win,
        gameInfo.results?.player_O_Lose,
        gameInfo.results?.draw,
      ];

      for (const player of players) {
        /*
         * Explicitly set the markup signal when testing player 'X'.
         * Player 'O' is assumed to be the default state.
         */
        if (player === 'x') {
          component.markup = 'x';
          component.ngOnInit();
          fixture.detectChanges();
        }

        /*
         * Collect only the result-related <span> elements.
         * Every second span is filtered out based on the HTML structure.
         */
        const resultSpans = fixture.debugElement
          .queryAll(By.css('span'))
          .filter((_, index) => index % 2 !== 0)
          .map((span) => (span.nativeElement as HTMLSpanElement).innerText);

        //Validate the number of rendered result spans.
        expect(resultSpans.length)
          .withContext(`Invalid span number: ${resultSpans.length}`)
          .toBe((player === 'o' ? player_O_results : player_X_results).length);

        // Validate the textual content of each result span.
        for (
          let i = 0;
          i < (player === 'o' ? player_O_results : player_X_results).length;
          i++
        ) {
          expect(resultSpans[i]).toBe(
            String((player === 'o' ? player_O_results : player_X_results)[i])
          );
        }
      }
    });

    /**
     * Verifies that the component displays the correct elapsed time
     * for both players based on the `markup` signal and the `playerSpentTime`
     * data from the game state.
     *
     * The test iterates through both possible player markups ('o' and 'x'),
     * updates the signals explicitly, triggers `ngOnInit` to initialize
     * the timer, and checks that the rendered <time> element shows
     * the correctly formatted hh:mm:ss string for each player.
     */
    it('Should display correct elapsed time for each player based on spentTime', async () => {
      const players: Exclude<GameInfo['actualMarkup'], undefined>[] = [
        'o',
        'x',
      ];

      const actualmarkupSignal = component[
        'actualMarkup'
      ] as unknown as WritableSignal<
        Exclude<GameInfo['actualMarkup'], undefined>
      >;

      for (const player of players) {
        // Update the signals to simulate the current player
        component.markup = player;
        actualmarkupSignal.set(player);

        // Re-run OnInit to ensure seconds are initialized properly
        component.ngOnInit();
        fixture.detectChanges();
        await fixture.whenStable();

        // Query the <time> element from the DOM
        const time = fixture.debugElement.query(By.css('time'))
          .nativeElement as HTMLTimeElement;

        // Compute the expected formatted time string
        const formatedTime = new Date(
          (player === 'o'
            ? gameInfo.playerSpentTime!.player_O!
            : gameInfo.playerSpentTime!.player_X!) * 1000
        )
          .toISOString()
          .slice(11, 19);

        // Assert that the DOM reflects the correct time
        expect(time.innerText).toEqual(formatedTime);
      }
    });

    /**
     * Verifies that the `[place]` HostBinding sets the correct `grid-column`
     * style based on the current screen width (Theme.width signal)
     * and the active player markup ('o' or 'x').
     *
     * The test iterates through all responsive breakpoints and both players,
     * ensuring layout positioning logic behaves deterministically.
     */
    it('[place] HostBinding should set correct gridColumn based on width and markup', () => {
      const themeService = TestBed.inject(Theme);

      // Width breakpoints with expected gridColumn values
      const cases = [
        { width: randomBetween(1001, 2000), o: '1 / 4', x: '18 / 21' },
        { width: randomBetween(601, 999), o: '1 / 10', x: '12 / 21' },
        { width: randomBetween(1, 599), o: '1 / 20', x: '1 / 20' },
        { width: undefined, o: '', x: '' },
      ];

      // Writable width signal from Theme service
      const currentValue = themeService.width as unknown as WritableSignal<
        number | undefined
      >;

      for (const player of ['o', 'x'] as const) {
        // Set active player markup
        component.markup = player;

        for (const testCase of cases) {
          // Simulate viewport width change
          currentValue.set(testCase.width);

          // Re-run init logic that depends on signals
          component.ngOnInit();

          // Apply HostBinding updates
          fixture.detectChanges();

          // Read computed inline styles
          const style = fixture.debugElement.nativeElement.style;

          // Select expected value based on player
          const expected = player === 'o' ? testCase.o : testCase.x;

          // Assert correct grid placement
          expect(style.gridColumn)
            .withContext(`actual width: ${testCase.width}`)
            .toEqual(expected);
        }
      }
    });
  });

  /**
   * Test suite that contains tests for the component's reactive effects.
   */
  describe('Effects:', () => {
    /**
     * Verifies that the first reactive effect correctly derives and assigns
     * the displayed win, lose, and draw numbers based on the current player markup.
     *
     * The test switches the `markup` signal between both players ('o' and 'x')
     * and asserts that:
     * - `winNumber` reflects the correct player-specific win count
     * - `loseNumber` reflects the correct player-specific lose count
     * - `drawNumber` is always taken from the shared draw result
     *
     * This ensures that the effect reacting to `results` and `markup`
     * stays consistent for both player panels.
     */
    it('First effect should update win/lose/draw numbers based on active player markup', async () => {
      // All valid player markups
      const players: Exclude<GameInfo['actualMarkup'], undefined>[] = [
        'o',
        'x',
      ];

      for (const player of players) {
        // Set current player
        component.markup = player;

        // Cast the component's results signal to a WritableSignal so it can be updated in tests
        const resultSignal = component.results as unknown as WritableSignal<
          GameInfo['results']
        >;

        // Update the results signal with the current gameInfo results, simulating a state change
        resultSignal.set({ ...gameInfo.results });

        // Initialize values that depend on markup
        component.ngOnInit();

        // Trigger effects and bindings
        fixture.detectChanges();
        await fixture.whenStable();

        // Resolve dynamic result keys (player_X / player_O)
        const key = `player_${player.toUpperCase()}`;
        const results = component.results()!;

        // Assert win count
        expect(component['winNumber'])
          .withContext(`winNumber (player:${player.toUpperCase()})`)
          .toBe(results[(key + '_Win') as keyof GameInfo['results']]);

        // Assert lose count
        expect(component['loseNumber'])
          .withContext(`loseNumber (player:${player.toUpperCase()})`)
          .toBe(results[(key + '_Lose') as keyof GameInfo['results']]);

        // Assert draw count (shared between players)
        expect(component['drawNumber'])
          .withContext(`drawNumber (player:${player.toUpperCase()})`)
          .toBe(results['draw']);
      }
    });

    /**
     * Verifies that the timer effect increments the seconds signal
     * once per second when the game is started and the player is active.
     */
    it('Second effect should increment seconds every second when started and markup is active', () => {
      // Install Jasmine fake timers to control setInterval
      jasmine.clock().install();

      try {
        const actualMarkupSignal = component[
          'actualMarkup'
        ] as unknown as WritableSignal<'x' | 'o'>;

        const startedSignal = component[
          'started'
        ] as unknown as WritableSignal<boolean>;

        // Set up test state: started game and active player
        component.markup = 'x';
        actualMarkupSignal.set('x');
        startedSignal.set(true);
        component.ngOnInit(); // initialize seconds
        fixture.detectChanges();

        // Simulate random elapsed time in seconds
        const spentTime = randomBetween(1, 1000);
        jasmine.clock().tick(spentTime * 1000);
        fixture.detectChanges();

        // Check that seconds signal has incremented correctly
        expect(component['seconds']()).toBe(
          spentTime +
            gameInfo['playerSpentTime']![
              `player_${component.markup.toUpperCase()}` as keyof GameInfo['playerSpentTime']
            ]
        );
      } finally {
        // Restore real timers
        jasmine.clock().uninstall();
      }
    });

    /**
     * Verifies that the third effect correctly updates the NgRx store
     * with the player's elapsed time every second when the game is started
     * and the markup matches the active player.
     */
    it('Third effect should dispatch modifyGameInfo with updated playerSpentTime', () => {
      // Install fake timers to control setInterval
      jasmine.clock().install();

      const players: Exclude<GameInfo['actualMarkup'], undefined>[] = [
        'x',
        'o',
      ];

      const actualMarkupSignal = component[
        'actualMarkup'
      ] as unknown as WritableSignal<'x' | 'o'>;
      const startedSignal = component[
        'started'
      ] as unknown as WritableSignal<boolean>;

      // Spy on store dispatch
      spyOn(store, 'dispatch');

      try {
        for (const player of players) {
          // Set active player and start the game
          component.markup = player;
          actualMarkupSignal.set(player);
          startedSignal.set(true);
          component.ngOnInit();
          fixture.detectChanges();

          // Simulate elapsed seconds
          const spentTime = randomBetween(1, 1000);
          jasmine.clock().tick(spentTime * 1000);
          fixture.detectChanges();

          const times: NonNullable<GameInfo['playerSpentTime']> =
            gameInfo['playerSpentTime']!;
          const key = `player_${player.toUpperCase()}`;

          // Expect store.dispatch to be called with updated player time
          expect(store.dispatch)
            .withContext(`actual player: ${player}`)
            .toHaveBeenCalledWith(
              modifyGameInfo({
                playerSpentTime: {
                  ...times,
                  [key]:
                    times[key as keyof GameInfo['playerSpentTime']] + spentTime,
                },
              })
            );
        }
      } finally {
        // Restore real timers
        jasmine.clock().uninstall();
      }
    });

    /**
     * Verifies the restart-handling effect.
     *
     * The test ensures that when both players' spent times are zero,
     * the component resets the `seconds` counter and marks the restart
     * as handled. It also verifies that once non-zero times appear,
     * the restart flag is cleared again, allowing future restarts
     * to be detected correctly.
     */
    it('Fourth effect should reset seconds and handle restart flag correctly', () => {
      const spentTimeSignal = component[
        'spentTimes'
      ] as unknown as WritableSignal<GameInfo['playerSpentTime'] | undefined>;

      const handledSignal = component[
        'restartHandled'
      ] as unknown as WritableSignal<boolean>;

      const secondsSignal = component[
        'seconds'
      ] as unknown as WritableSignal<number>;

      // --- Case 1: both player times are zero and restart was not handled yet ---
      handledSignal.set(false);
      secondsSignal.set(randomBetween(1, 1000)); // non-zero to verify reset

      spentTimeSignal.set({ player_O: 0, player_X: 0 });
      fixture.detectChanges();

      expect(secondsSignal()).toBe(0);
      expect(handledSignal()).toBe(true);

      // --- Case 2: restart already handled, times are no longer zero ---
      handledSignal.set(true);
      spentTimeSignal.set({
        player_O: randomBetween(1, 1000),
        player_X: randomBetween(1, 1000),
      });
      fixture.detectChanges();

      expect(handledSignal()).toBe(false);
    });
  });
});
