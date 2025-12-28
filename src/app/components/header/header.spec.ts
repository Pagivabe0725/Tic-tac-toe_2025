import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { provideZonelessChangeDetection } from '@angular/core';
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { GameInfo } from '../../utils/interfaces/game-info.interface';
import { reserGameInfo } from '../../store/actions/game-info-reset.action';

/**
 * @fileoverview
 * Unit tests for the Header component.
 *
 * - Verifies HTML rendering, including conditional display of the winner div.
 * - Tests component methods, such as `startNewGame`, ensuring correct NgRx store interactions.
 * - Uses zoneless change detection and mock store for isolated testing.
 */

describe('Header', () => {
  let fixture: ComponentFixture<Header>;
  let component: Header;
  let selectSignalSpy: jasmine.Spy;

  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: {} }),
      ],
    });

    store = TestBed.inject(Store);

    selectSignalSpy = spyOn(store, 'selectSignal');
  });

  /**
   * Tests related to the Header component's HTML rendering,
   * including conditional display of the winner div.
   */
  describe('HTML:', () => {
    /**
     * Verifies that the winner element is not rendered
     * when the game has no winner.
     */
    it('Should not render the winner div when there is no winner', async () => {
      // Mock selector to simulate a game state without a winner
      selectSignalSpy.and.returnValue((selector: any) => {
        return null;
      });

      // Create component instance
      fixture = TestBed.createComponent(Header);
      component = fixture.componentInstance;

      // Trigger change detection
      fixture.detectChanges();

      await fixture.whenStable();

      // Access the internal winner signal
      const winner = component['winner']();

      // Query the emphasized winner display element
      const resultDiv = fixture.debugElement.query(
        By.css('#own-app-ephasize-div')
      );

      // Verify that the winner element is not rendered
      expect(resultDiv).toBeFalsy();
    });

    // Iterate over all possible winner values to run the same test logic
    for (const winner of ['o', 'draw', 'x'] as GameInfo['winner'][]) {
      /**
       * Ensures that the winner div is rendered correctly
       * when the winner is a specific value ('o', 'x', or 'draw').
       */
      it(`Should render the winner div when the winner is "${winner}"`, () => {
        // Mock selector to return the current winner
        selectSignalSpy.and.returnValue((selector: any) => winner);

        // Create the component instance
        fixture = TestBed.createComponent(Header);
        component = fixture.componentInstance;

        // Trigger Angular change detection to update the view
        fixture.detectChanges();

        // Verify that the internal winner signal matches the mocked value
        expect(component.winner()).toBe(winner);

        // Query the winner display element in the DOM
        const resultDiv = fixture.debugElement.query(
          By.css('#own-app-ephasize-div')
        );

        // Ensure that the winner div is rendered
        expect(resultDiv).toBeTruthy();
      });
    }
  });

  /**
   * Tests related to the component's methods.
   */
  describe('Component methods:', () => {
    /**
     * Tests the [startNewGame] method.
     */
    describe('[startNewGame] function:', () => {
      /**
       * Ensures that calling startNewGame dispatches the `reserGameInfo` action.
       */
      it('Should dispatch the `reserGameInfo` action', () => {
        // Mock selector to simulate a game state
        selectSignalSpy.and.returnValue((selector: any) => 'x');

        // Spy on the store's dispatch method
        spyOn(store, 'dispatch');

        // Create the component instance
        fixture = TestBed.createComponent(Header);
        component = fixture.componentInstance;

        // Trigger change detection
        fixture.detectChanges();

        // Call the method under test
        component['startNewGame']();

        // Verify that the correct action was dispatched
        expect(store.dispatch).toHaveBeenCalledOnceWith(reserGameInfo());
      });
    });
  });
});
