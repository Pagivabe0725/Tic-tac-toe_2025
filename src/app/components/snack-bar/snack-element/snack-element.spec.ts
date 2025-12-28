import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackElement } from './snack-element';
import {
  InputSignal,
  provideZonelessChangeDetection,
  signal,
  WritableSignal,
} from '@angular/core';
import { snackbarTemplate } from '../../../utils/interfaces/snackbar.interface';
import { By } from '@angular/platform-browser';
import { randomNumber } from '../../../utils/test/functions/random-values.function';

/**
 * @fileoverview
 * Unit tests for the SnackElement component.
 *
 * Covers:
 * - HTML rendering:
 *   - Verifies correct display of snackbar duration and content.
 *   - Ensures default and error-specific styles are applied correctly.
 * - Component methods:
 *   - close: verifies interval cleanup and correct emission of the close event
 *     for both basic and error snackbar variants.
 *
 * The tests use Angular signals for input handling, zoneless change detection,
 * and DOM interaction to validate component behavior.
 */

describe('SnackElement', () => {
  /** The SnackElement component instance under test. */
  let component: SnackElement;

  /** Fixture providing access to the component instance and its rendered template. */
  let fixture: ComponentFixture<SnackElement>;

  const basicSnackbarObject: snackbarTemplate = {
    id: 0,
    duration: 15,
    content: 'Test',
    error: false,
  };

  const errorSnackbarObject: snackbarTemplate = {
    ...basicSnackbarObject,
    error: true,
  };

  let snackbarSignal: WritableSignal<snackbarTemplate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SnackElement],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SnackElement);
    component = fixture.componentInstance;
    component['SnackBarObject'] = signal(
      basicSnackbarObject
    ) as unknown as InputSignal<snackbarTemplate>;

    snackbarSignal = component[
      'SnackBarObject'
    ] as unknown as WritableSignal<snackbarTemplate>;

    fixture.detectChanges();
  });

  /**
   * Tests related to the SnackBar component's HTML rendering.
   */
  describe('HTML:', () => {
    /**
     * Ensures that a basic snackbar is rendered with default styles
     * and displays the correct duration and content.
     */
    it('Should display a simple snackbar with default styles', () => {
      // Query all span elements rendered by the snackbar
      const spans = fixture.debugElement.queryAll(By.css('span'));

      // Verify that no custom styles are applied for a basic snackbar
      expect(fixture.debugElement.styles['color']).toBe('');
      expect(fixture.debugElement.styles['fontWeight']).toBe('');

      // Verify displayed duration
      expect((spans[0].nativeElement as HTMLSpanElement).innerText).toEqual(
        basicSnackbarObject.duration.toString()
      );

      // Verify displayed content
      expect((spans[1].nativeElement as HTMLSpanElement).innerText).toEqual(
        basicSnackbarObject.content
      );
    });

    /**
     * Ensures that an error snackbar is rendered with error styles
     * and displays the correct duration and content.
     */
    it('Should display an error snackbar with error styles', () => {
      // Set the snackbar signal to an error state
      snackbarSignal.set(errorSnackbarObject);

      // Trigger change detection to update the view
      fixture.detectChanges();

      // Query all span elements rendered by the snackbar
      const spans = fixture.debugElement.queryAll(By.css('span'));

      // Verify that error-specific styles are applied
      expect(fixture.debugElement.styles['color']).toBe('red');
      expect(fixture.debugElement.styles['fontWeight']).toBe('bolder');

      // Verify displayed duration
      expect((spans[0].nativeElement as HTMLSpanElement).innerText).toEqual(
        errorSnackbarObject.duration.toString()
      );

      // Verify displayed content
      expect((spans[1].nativeElement as HTMLSpanElement).innerText).toEqual(
        errorSnackbarObject.content
      );
    });
  });

  /**
   * Tests related to the component's public and internal methods.
   */
  describe('Component methods:', () => {
    /** Spy for the global `clearInterval` function to verify interval cleanup. */
    let clearIntervalSpy: jasmine.Spy;

    beforeEach(() => {
      // Spy on the component's close method while allowing its original behavior
      spyOn<any>(component, 'close').and.callThrough();

      // Spy on the close event emitter
      const closeEvent = component['closeEvent'];
      spyOn(closeEvent, 'emit');

      // Spy on the global clearInterval function
      clearIntervalSpy = spyOn(window, 'clearInterval');
    });

    /**
     * Ensures that closing a basic snackbar clears the interval
     * and emits the close event with the correct snackbar id.
     */
    it('[close] should close a basic snackbar and emit its id', () => {
      const randomId = randomNumber(100000);

      // Set a basic snackbar state
      snackbarSignal.set({ ...basicSnackbarObject, id: randomId });

      fixture.detectChanges();

      // Trigger the close action via button click
      const closeButton = fixture.debugElement.query(By.css('button'));
      closeButton.triggerEventHandler('click');

      // Verify that the close method was executed
      expect(component['close']).toHaveBeenCalled();

      // Verify that the interval was cleared
      expect(clearIntervalSpy).toHaveBeenCalled();

      // Verify that the close event was emitted with the correct id
      expect(component['closeEvent'].emit).toHaveBeenCalledOnceWith(randomId);
    });

    /**
     * Ensures that closing an error snackbar clears the interval
     * and emits the close event with the correct snackbar id.
     */
    it('[close] should close an error snackbar and emit its id', () => {
      const randomId = randomNumber(100000);

      // Set an error snackbar state
      snackbarSignal.set({ ...errorSnackbarObject, id: randomId });

      fixture.detectChanges();

      // Trigger the close action via button click
      const closeButton = fixture.debugElement.query(By.css('button'));
      closeButton.triggerEventHandler('click');

      // Verify that the close method was executed
      expect(component['close']).toHaveBeenCalled();

      // Verify that the interval was cleared
      expect(clearIntervalSpy).toHaveBeenCalled();

      // Verify that the close event was emitted with the correct id
      expect(component['closeEvent'].emit).toHaveBeenCalledOnceWith(randomId);
    });
  });
});
