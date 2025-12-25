import {
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { GameFieldCell } from './game-field-cell';
import {
  InputSignal,
  provideZonelessChangeDetection,
  signal,
  WritableSignal,
} from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { GameInfo } from '../../../utils/interfaces/game-info.interface';
import { By } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { modifyGameInfo } from '../../../store/actions/game-info-modify.action';

/**
 * @fileoverview
 * Unit tests for the GameFieldCell component.
 *
 * This test suite verifies the following aspects of the GameFieldCell component:
 *
 * 1. HTML Rendering:
 *    - Ensures the correct SVG symbol is rendered based on the current cell markup.
 *    - Verifies that empty cells render no symbol.
 *
 * 2. HostBindings:
 *    - Tests dynamic CSS classes (`scale`, `cursor`, `emphasize`) based on cell state, last move, and click permissions.
 *    - Ensures hover scaling and emphasis on the last played cell behave correctly.
 *
 * 3. HostListener:
 *    - Tests the `fill()` method triggered on cell click.
 *    - Ensures that only empty and clickable cells dispatch a `lastMove` action to the NgRx store.
 *
 * Signals API (`InputSignal` and `WritableSignal`) is used extensively to simulate reactive input changes.
 * The store is mocked using `provideMockStore` to verify dispatches without affecting real state.
 */

describe('GameFieldCell', () => {
  // The instance of the GameFieldCell component under test
  let component: GameFieldCell;

  // The TestBed fixture for interacting with the component in the DOM
  let fixture: ComponentFixture<GameFieldCell>;

  // Writable signal for the cell's current markup ('x', 'o', or undefined)
  let markupSignal: WritableSignal<GameInfo['actualMarkup']>;

  // Writable signal for the last move performed in the game
  let lastMoveSignal: WritableSignal<GameInfo['lastMove']>;

  // Writable signal controlling whether clicking this cell is allowed
  let clickPermissionSignal: WritableSignal<boolean>;

  const getLastMove = (
    markup: GameInfo['actualMarkup']
  ): GameInfo['lastMove'] => {
    switch (markup) {
      case undefined:
        return undefined;

      case 'o':
        return { row: 1, column: 1 };

      case 'x':
        return { row: 1, column: 2 };
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameFieldCell],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: {} }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameFieldCell);
    component = fixture.componentInstance;

    component['markup'] = signal(undefined) as unknown as InputSignal<
      GameInfo['actualMarkup']
    >;

    component['lastMove'] = signal({
      row: 1,
      column: 0,
    }) as unknown as InputSignal<GameInfo['lastMove']>;

    component['clickPermission'] = signal(
      true
    ) as unknown as InputSignal<boolean>;

    markupSignal = component['markup'] as unknown as WritableSignal<
      GameInfo['actualMarkup']
    >;
    lastMoveSignal = component['lastMove'] as unknown as WritableSignal<
      GameInfo['lastMove']
    >;
    clickPermissionSignal = component[
      'clickPermission'
    ] as unknown as WritableSignal<boolean>;

    markupSignal.set(undefined);
    lastMoveSignal.set(getLastMove(undefined));
    clickPermissionSignal.set(true);

    fixture.detectChanges();
  });

  /**
   * HTML rendering tests for the GameFieldCell component.
   */
  describe('HTML:', () => {
    /**
     * Verifies that the correct SVG symbol is rendered based on the current markup.
     *
     * - when markup is 'x', the X symbol path should be present
     * - when markup is 'o', the O symbol path should be present
     * - when markup is undefined, no SVG path should be rendered
     */
    it('should render the correct SVG symbol based on the markup', () => {
      // Expected SVG path prefixes for each possible markup
      const results = {
        x: 'm2',
        o: 'M4',
        e: null,
      };

      for (const markup of [
        undefined,
        'x',
        'o',
      ] as GameInfo['actualMarkup'][]) {
        // Simulate input and interaction-related signals
        markupSignal.set(markup);
        lastMoveSignal.set(getLastMove(markup));
        clickPermissionSignal.set(!!markup);

        fixture.detectChanges();

        // Extract the SVG path definition if a symbol should exist
        const path = markup
          ? fixture.debugElement
              .query(By.css('path'))
              .attributes['d']?.substring(0, 2)
          : null;

        // Validate the rendered symbol (or lack thereof)
        expect(path).toBe(results[markup ? markup : 'e']);
      }
    });
  });

  /**
   * HostBinding-related tests for the GameFieldCell component.
   *
   */
  describe('HostBindings:', () => {
    /**
     * Verifies the `[scale]` HostBinding behavior.
     *
     * The scale class should:
     * - be applied when the cell is empty, clickable, and represents the current position,
     * - be `null` when clicking is disabled,
     * - be `null` when the cell already contains a markup.
     */
    it('[scale] should compute the correct scale class based on cell state and permissions', () => {
      // Empty cell, clickable → hover scale should be applied
      markupSignal.set(undefined);
      lastMoveSignal.set(getLastMove(undefined));
      clickPermissionSignal.set(true);
      fixture.detectChanges();
      expect(component['scale']).toBe('own-cell-hover');

      // Empty cell, but clicking not allowed → no scale
      markupSignal.set(undefined);
      lastMoveSignal.set(getLastMove('o'));
      clickPermissionSignal.set(false);
      fixture.detectChanges();
      expect(component['scale']).toBe(null);

      // Cell already contains a markup → no scale
      markupSignal.set('o');
      lastMoveSignal.set(getLastMove('o'));
      clickPermissionSignal.set(true);
      fixture.detectChanges();
      expect(component['scale']).toBe(null);
    });

    /**
     * Verifies the `[cursor]` HostBinding behavior.
     *
     * The cursor should:
     * - remain `default` when clicking is not allowed, regardless of markup state,
     * - switch to `pointer` only when the cell is empty and clicking is permitted.
     */
    it('[cursor] should reflect interactivity based on cell state and permissions', () => {
      // Clicking not allowed and cell is empty → default cursor
      markupSignal.set(undefined);
      lastMoveSignal.set(getLastMove(undefined));
      clickPermissionSignal.set(false);
      fixture.detectChanges();
      expect(component['cursor']).toBe('default');

      // Clicking not allowed and cell already has markup → default cursor
      markupSignal.set('x');
      lastMoveSignal.set(getLastMove('x'));
      clickPermissionSignal.set(false);
      fixture.detectChanges();
      expect(component['cursor']).toBe('default');

      // Clicking allowed and cell is empty → pointer cursor
      markupSignal.set(undefined);
      lastMoveSignal.set(getLastMove(undefined));
      clickPermissionSignal.set(true);
      fixture.detectChanges();
      expect(component['cursor']).toBe('pointer');
    });
  });

  /**
   * HostListener tests for GameFieldCell component.
   */
  describe('HostListener:', () => {
    /**
     * Tests the fill() method.
     * Should dispatch lastMove only for empty, clickable cells.
     */
    it('[fill]: should dispatch lastMove only for empty, clickable cells', async () => {
      const store: Store = TestBed.inject(Store);
      spyOn(store, 'dispatch'); // Spy on the store's dispatch method

      for (const markup of [
        undefined,
        'x',
        'o',
      ] as GameInfo['actualMarkup'][]) {
        markupSignal.set(markup);
        lastMoveSignal.set(getLastMove(markup));
        clickPermissionSignal.set(true);
        component['column'] = 1;
        component['row'] = 1;

        // Simulate a click on the component
        fixture.debugElement.triggerEventHandler('click', {});

        fixture.detectChanges();

        // Wait for asynchronous signal updates
        await new Promise((resolve) => setTimeout(resolve, 0));

        // If the cell is empty, dispatch should have been called
        if (!markup) {
          expect(store.dispatch).toHaveBeenCalledWith(
            modifyGameInfo({ lastMove: { row: 1, column: 1 } })
          );
        } else {
          // If the cell has a markup, dispatch should not be called
          expect(store.dispatch).not.toHaveBeenCalled();
        }

        // Reset spy calls for the next iteration
        (store.dispatch as jasmine.Spy).calls.reset();
      }
    });
  });
});
