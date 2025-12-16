import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Order } from './order';
import {
  InputSignal,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { GameOrder } from '../../../../utils/types/order.type';
import { generateRandomOrder } from '../../../../utils/test/functions/random-values.function';
import { By } from '@angular/platform-browser';

/**
 * @fileoverview
 * Unit tests focusing on the Order component’s behavior and rendering logic.
 *
 * The tests verify:
 * - Correct visual highlighting of the currently selected order in the template
 * - Proper emission of navigation parameters when a valid order change occurs
 * - Error emission when an invalid order value is provided
 * - Validation logic that accepts valid orders and rejects invalid ones
 */

describe('Order', () => {
  /**
   * The Order component instance under test.
   * Provides access to its methods and properties for unit testing.
   */
  let component: Order;

  /**
   * Angular test fixture for the Order component.
   * Allows access to the component instance, DOM elements, and triggers change detection.
   */
  let fixture: ComponentFixture<Order>;

  /**
   * The current game order value used as input for the Order component.
   * Represents the selected order option during tests.
   */
  let order: GameOrder;

  /**
   * Initializes the testing module, creates the component instance,
   * and provides the required `order` InputSignal.
   */
  beforeEach(async () => {
    order = generateRandomOrder();

    await TestBed.configureTestingModule({
      imports: [Order],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Order);
    component = fixture.componentInstance;

    // Override required input signal with a test value
    (component as any)['order'] = signal(
      order
    ) as unknown as InputSignal<GameOrder>;

    fixture.detectChanges(); // Trigger initial rendering
  });

  /**
   * HTML rendering tests
   */
  describe('HTML:', () => {
    /**
     * Verifies that only the currently selected order button
     * has the `active-order-button` CSS class applied.
     */
    it('Should emphasize the selected button', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));

      for (const button of buttons) {
        const htmlButton = button.nativeElement as HTMLButtonElement;

        if (order === htmlButton.name) {
          // The selected button should have the active class
          expect(
            htmlButton.classList.contains('active-order-button')
          ).toBeTrue();
        } else {
          // All other buttons should not have the active class
          expect(
            htmlButton.classList.contains('active-order-button')
          ).toBeFalse();
        }
      }
    });
  });

  /**
   * Component method tests
   */
  describe('Component methods:', () => {
    describe('[changeOrder] function:', () => {
      /**
       * Ensures changeOrder emits the correct `changeParamsEvent`
       * when called with a valid order value different from the current one.
       */
      it('Should emit `changeParamsEvent` when changeOrder is called with valid value', () => {
        /**
         * Temporary variable used to hold a new game order value during tests.
         * Ensures that the new order is different from the current one for testing changeOrder behavior.
         */
        let newOrder = order;

        // Ensure a different order value is selected for the test
        while (newOrder === order) {
          newOrder = generateRandomOrder();
        }

        // Spy on the OutputEmitterRef to verify emission
        const emitSpy = spyOn(component['changeParamsEvent'], 'emit');

        // Call the method
        component['changeOrder'](newOrder);

        // Expect the emit to be called with correct routing parameters
        expect(emitSpy).toHaveBeenCalledOnceWith({
          path: ['account'],
          queryParams: { order: newOrder },
          queryParamsHandling: 'merge',
        });
      });

      /**
       * Ensures changeOrder emits an `errorEvent` when called
       * with an invalid order value.
       */
      it('Should emit `errorEvent` when changeOrder is called with invalid value', () => {
        const invalidOrder = 'invalid';

        // Spy on errorEvent emitter
        const emitSpy = spyOn(component['errorEvent'], 'emit');

        // Call changeOrder with invalid value
        component['changeOrder'](invalidOrder as GameOrder);

        // Expect the error message to be emitted
        expect(emitSpy).toHaveBeenCalledOnceWith(
          `Invalid order value: ${invalidOrder}`
        );
      });
    });

    describe('[checkOrder] function:', () => {
      /**
       * Verifies that checkOrder does not throw for a valid order
       */
      it('Should not throw an error for a valid order value', () => {
        expect(() => component['checkOrder']('time-asc')).not.toThrowError();
      });

      /**
       * Verifies that checkOrder throws for an invalid order
       */
      it('Should throw an error for an invalid order value', () => {
        expect(() => component['checkOrder']('invalid value')).toThrowError();
      });
    });
  });
});
