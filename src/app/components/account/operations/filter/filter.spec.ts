import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Filter } from './filter';
import {
  DebugElement,
  InputSignal,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { savedGameStatus } from '../../../../utils/types/game-status.type';
import {
  generateRandomStartedStatus,
  generateRandomStatus,
  randomNumber,
} from '../../../../utils/test/functions/random-values.function';
import { By } from '@angular/platform-browser';
import { SAVED_GAME_STATUSES } from '../../../../utils/constants/saved-game-status.constant';

/**
 * @fileoverview
 * Unit tests focusing on the Filter component’s behavior and template binding.
 *
 * The tests verify:
 * - Correct rendering of the select element and its options
 * - Proper interpretation and validation of filter values
 * - Emission of navigation parameters when the filter changes
 * - Error propagation when invalid filter values are provided
 */

describe('Filter', () => {
  /**
   * The Filter component instance under test.
   * Provides access to its methods and properties for unit testing.
   */
  let component: Filter;

  /**
   * Angular test fixture for the Filter component.
   * Allows access to the component instance, DOM elements, and triggers change detection.
   */
  let fixture: ComponentFixture<Filter>;

  /**
   * The current saved game status used as input for the Filter component.
   * Represents the selected filter value during tests.
   */
  let actualStatus: savedGameStatus;

  /**
   * Initializes the testing module, creates component, and sets up signals.
   */
  beforeEach(async () => {
    actualStatus = generateRandomStatus();

    await TestBed.configureTestingModule({
      imports: [Filter],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Filter);
    component = fixture.componentInstance;

    // Override private filter signal with test value
    (component as any)['filter'] = signal(
      actualStatus
    ) as unknown as InputSignal<savedGameStatus | null>;

    fixture.detectChanges(); // Trigger initial change detection
  });

  /**
   * HTML rendering tests
   */
  describe('HTML:', () => {
    /**
     * DebugElement representing the select HTML element in the Filter component template.
     * Used to query and verify option values and user interactions in unit tests.
     */
    let select: DebugElement;

    beforeEach(() => {
      // Query the select element from the template
      select = fixture.debugElement.query(By.css('select'));
    });

    /**
     * Verify that the select element displays the current filter value
     */
    it('Should display the incoming filter value in the select', () => {
      expect(select.nativeElement.value).toEqual(actualStatus);
    });

    /**
     * Verify that the options in the select match the allowed SAVED_GAME_STATUSES
     */
    it('Should render options that match the elements of the array', () => {
      const options = select.queryAll(By.css('option'));
      const chosableOptions = ['null', ...SAVED_GAME_STATUSES];

      expect(options.length).toEqual(chosableOptions.length);

      for (let i = 0; i < options.length; i++) {
        const option = (options[i].nativeElement as HTMLOptionElement).value;
        expect(option).toEqual(chosableOptions[i]);
      }
    });
  });

  /**
   * Component methods tests, including private methods
   */
  describe('Component methods:', () => {
    /**
     * Tests for the private checkFilter() method
     */
    describe('[checkFilter] function:', () => {
      it('Should return null when value is `null` (string type)', () => {
        const result = component['checkFilter']('null');
        expect(result).toBe(null);
      });

      it('Should return the value when it is a valid savedGameStatus', () => {
        const randomStatus = generateRandomStartedStatus();
        const result = component['checkFilter'](randomStatus);
        expect(result).toBe(randomStatus);
      });

      it('Should throw an error for an invalid savedGameStatus value', () => {
        const invalidValue = 'invalid-status';
        expect(() => component['checkFilter'](invalidValue)).toThrowError(
          `Invalid status value : ${invalidValue}`
        );
      });
    });

    /**
     * Tests for the private changeFilter() method
     */
    describe('[changeFilter] function', () => {
      it('Should trigger `changeParamsEvent` when a SavedGameStatus value is provided', () => {
        const randomStatus = generateRandomStatus();
        const emitSpy = spyOn(component['changeParamsEvent'], 'emit');

        component['changeFilter'](randomStatus);

        expect(emitSpy).toHaveBeenCalledOnceWith({
          path: ['account'],
          queryParams: { filter: randomStatus, page: 1 },
          queryParamsHandling: 'merge',
        });
      });

      it('Should trigger `changeParamsEvent` when a null value is provided', () => {
        const emitSpy = spyOn(component['changeParamsEvent'], 'emit');

        component['changeFilter'](null);

        expect(emitSpy).toHaveBeenCalledOnceWith({
          path: ['account'],
          queryParams: { filter: null, page: 1 },
          queryParamsHandling: 'merge',
        });
      });
    });

    /**
     * Tests for the public setFilter() method
     */
    describe('[setFilter] function:', () => {
      beforeEach(() => {
        // Spy on the snackbar service to monitor error messages
        /*    snackbarService = TestBed.inject(SnackBarHandler);
        spyOn(snackbarService, 'addElement'); */
      });

      it('Should trigger `changeFilter` function when a valid value is provided', () => {
        spyOn<any>(component, 'changeFilter'); // Spy private method
        const chosableValues = ['null', ...SAVED_GAME_STATUSES];
        const randomValue = chosableValues[randomNumber(chosableValues.length)];

        component['setFilter'](randomValue);

        expect(component['changeFilter']).toHaveBeenCalledOnceWith(
          (randomValue === 'null'
            ? null
            : randomValue) as savedGameStatus | null
        );
      });

      it('Should handle error correctly when checkFilter throws', () => {
        const emitSpy = spyOn(component['errorEvent'], 'emit');
        const invalidFilterValue = 'invalidFilterValue';
        // Call setFilter with invalid value
        component['setFilter'](invalidFilterValue);

        // Validate that snackbar was triggered for error handling
        expect(emitSpy).toHaveBeenCalledOnceWith('Filter action failed');
      });
    });
  });
});
