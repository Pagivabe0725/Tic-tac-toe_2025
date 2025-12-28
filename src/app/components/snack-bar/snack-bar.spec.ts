import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackBar } from './snack-bar';
import { provideZonelessChangeDetection } from '@angular/core';
import { SnackBarHandler } from '../../services/snack-bar-handler.service';
import { By } from '@angular/platform-browser';
import {
  randomBetween,
  randomNumber,
} from '../../utils/test/functions/random-values.function';

/**
 * @fileoverview
 * Unit tests for the SnackBar component.
 *
 * Covers:
 * - HTML rendering: ensures the correct number of snackbar elements are displayed.
 * - Life cycle hooks:
 *   - ngOnInit: verifies that the interval is set and `snackbarService.tick` is called.
 *   - ngOnDestroy: verifies that the interval is cleared to prevent memory leaks.
 * - Component methods:
 *   - closeElement: verifies that clicking a snackbar element's close button
 *     calls both the component's private method and `snackbarService.deleteElement`
 *     with the correct element id.
 *
 * Uses zoneless change detection and spies on services to isolate component behavior.
 */

describe('SnackBar', () => {
  /** The SnackBar component instance under test. */
  let component: SnackBar;

  /** Fixture providing access to the component instance and its rendered template. */
  let fixture: ComponentFixture<SnackBar>;

  /** Service responsible for managing snackbar state and behavior. */
  let snackbarService: SnackBarHandler;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackBar],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackBar);
    component = fixture.componentInstance;

    snackbarService = TestBed.inject(SnackBarHandler);

    fixture.detectChanges();
  });

  /**
   * Tests related to the SnackBar component's HTML rendering.
   */
  describe('HTML:', () => {
    /**
     * Ensures that the component renders the correct number of
     * `app-snack-element` instances based on the snackbar service state.
     */
    it('Should render the correct number of app-snack-element components', () => {
      const randomNumber = randomBetween(1, 4);

      // Add a random number of snackbar elements
      for (let i = 0; i < randomNumber; i++) {
        snackbarService.addElement(`Test ${i}`, true);
      }

      // Trigger change detection to update the view
      fixture.detectChanges();

      // Query rendered snackbar elements
      const elements = fixture.debugElement.queryAll(
        By.css('app-snack-element')
      );

      // Verify that the rendered element count matches the service state
      expect(elements.length).toBe(randomNumber);
    });
  });

  /**
   * Tests for Angular lifecycle hooks of the component.
   *
   * Includes:
   * - ngOnInit: ensures intervals and related actions are set up correctly.
   * - ngOnDestroy: ensures intervals are cleared to prevent memory leaks.
   */
  describe('Life cycle hooks:', () => {
    /**
     * Tests related to Angular lifecycle hooks.
     */
    describe('Life cycle hooks:', () => {
      /**
       * Ensures that ngOnInit sets up the interval and calls `tick` on the snackbar service.
       */
      it('[ngOnInit] Should call `snackbarService.tick` via interval when it is executed', async () => {
        // Spy on the snackbar service's tick method before ngOnInit is called
        spyOn(snackbarService, 'tick');

        // Trigger ngOnInit via change detection
        fixture.detectChanges();

        // Wait 1 second to allow the interval to execute
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Verify that tick has been called by the interval
        expect(snackbarService.tick).toHaveBeenCalled();
      });

      /**
       * Ensures that ngOnDestroy clears the interval set by ngOnInit.
       */
      it('[ngOnDestroy] should call clearInterval', () => {
        // Spy on the global clearInterval function to track calls
        spyOn(window, 'clearInterval');

        // Trigger ngOnInit to initialize the interval
        fixture.detectChanges();

        // Call ngOnDestroy manually to clear the interval
        component.ngOnDestroy();

        // Verify that clearInterval was called
        expect(clearInterval).toHaveBeenCalled();
      });
    });
  });

  /**
   * Tests related to the component's methods.
   */
  describe('Component methods:', () => {
    /**
     * Ensures that clicking the close button on a snackbar element
     * calls the component's `closeElement` method and triggers
     * `snackbarService.deleteElement` with the correct element id.
     */
    it('[closeElement] should call `snackbarService.deleteElement` with the clicked element id', () => {
      // Spy on the snackbar service method
      spyOn(snackbarService, 'deleteElement');

      // Spy on the component's private method and allow original implementation
      spyOn<any>(component, 'closeElement').and.callThrough();

      // Add multiple test elements to the snackbar
      for (let i = 0; i < 4; i++) {
        snackbarService.addElement(`Test ${i}`, true);
      }

      // Trigger change detection to render elements
      fixture.detectChanges();

      // Randomly choose an element to click
      const chosenElementNumber = randomNumber(4);

      // Find all snackbar elements in the DOM
      const element = fixture.debugElement.queryAll(
        By.css('app-snack-element')
      )[chosenElementNumber];

      // Find and click the close button
      const elementButton = element.query(By.css('button'));
      elementButton.triggerEventHandler('click');

      // Verify that the component's method was called with the correct id
      expect(component['closeElement']).toHaveBeenCalledOnceWith(
        chosenElementNumber
      );

      // Verify that the service method was called with the correct id
      expect(snackbarService.deleteElement).toHaveBeenCalledOnceWith(
        chosenElementNumber
      );
    });
  });
});
