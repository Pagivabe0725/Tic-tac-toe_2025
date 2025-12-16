/**
 * @fileoverview Unit tests for the Operations component.
 *
 * The tests focus on verifying:
 * - Proper interaction with RouterService during navigation
 * - Centralized error handling via SnackBarHandler
 * - Correct usage of Angular signals as InputSignal mocks
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Operations } from './operations';
import {
  InputSignal,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { RouterService } from '../../../services/router.service';
import { SnackBarHandler } from '../../../services/snack-bar-handler.service';
import { GameOrder } from '../../../utils/types/order.type';
import { savedGameStatus } from '../../../utils/types/game-status.type';
import { SAVED_GAME_STATUSES } from '../../../utils/constants/saved-game-status.constant';
import { ORDERS } from '../../../utils/constants/order.constant';
import {
  generateRandomOrder,
  generateRandomStatus,
  randomBetween,
  randomNumber,
} from '../../../utils/test/functions/random-values.function';

/**
 * Test suite for the Operations component.
 */
describe('Operations', () => {
  /**
   * The Operations component instance under test.
   * Provides access to its methods and properties for unit testing.
   */
  let component: Operations;

  /**
   * Angular test fixture for the Operations component.
   * Allows access to the component instance, DOM elements, and triggers change detection.
   */
  let fixture: ComponentFixture<Operations>;

  /**
   * SnackBarHandler service instance used to spy on notifications and error messages.
   */
  let snackbarService: SnackBarHandler;

  /**
   * RouterService instance used to verify navigation triggered by the component.
   */
  let routerService: RouterService;

  /**
   * Total number of available pages used as input for the Operations component.
   * Represents the upper bound for pagination-related tests.
   */
  let pageCount: number;

  /**
   * The currently active page number used as input for the Operations component.
   * Represents the current page state during tests.
   */
  let actualPage: number;

  /**
   * The current game order used as input for the Operations component.
   * Represents the selected order option during tests.
   */
  let order: GameOrder;

  /**
   * The current saved game status filter used as input for the Operations component.
   * Represents the selected filter option during tests.
   */
  let filter: savedGameStatus;

  /**
   * Sets up the testing module and initializes the component
   * with mocked InputSignals and injected services.
   */
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Operations],
      providers: [
        provideZonelessChangeDetection(),
        { provide: RouterService, useFactory: () => new RouterService() },
        { provide: SnackBarHandler, useFactory: () => new SnackBarHandler() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Operations);
    component = fixture.componentInstance;

    pageCount = 10;
    actualPage = 1;

    filter = SAVED_GAME_STATUSES[randomNumber(SAVED_GAME_STATUSES.length)];
    order = ORDERS[randomNumber(ORDERS.length)];

    snackbarService = TestBed.inject(SnackBarHandler);
    routerService = TestBed.inject(RouterService);

    // Mock component inputs using signals
    (component as any)['page'] = signal(
      actualPage
    ) as unknown as InputSignal<number>;
    (component as any)['pageCount'] = signal(
      pageCount
    ) as unknown as InputSignal<number>;
    (component as any)['order'] = signal(
      order
    ) as unknown as InputSignal<GameOrder>;
    (component as any)['filter'] = signal(
      filter
    ) as unknown as InputSignal<savedGameStatus>;

    fixture.detectChanges();
  });

  /**
   * Tests covering public and private component methods.
   */
  describe('Component methods', () => {
    /**
     * Verifies navigation logic and RouterService integration.
     */
    describe('[navigate]', () => {
      it('should forward navigation data to RouterService', () => {
        spyOn(routerService, 'navigateTo');

        const filter = generateRandomStatus();
        const order = generateRandomOrder();
        const page = randomBetween(actualPage, pageCount);

        const params = { filter, order, page };

        component['navigate']({
          path: ['account'],
          queryParams: params,
          queryParamsHandling: 'merge',
        });

        expect(routerService.navigateTo).toHaveBeenCalledOnceWith(
          ['account'],
          params,
          'merge'
        );
      });
    });

    /**
     * Verifies centralized error handling behavior.
     */
    describe('[handleErrors]', () => {
      it('should log the error and display it via SnackBarHandler', () => {
        spyOn(snackbarService, 'addElement');
        const errorEmit = spyOn(console, 'error');

        const errorMessage = 'This is an ERROR MESSAGE used FOR TESTING.';

        component['handleErrors'](errorMessage);

        expect(errorEmit).toHaveBeenCalledOnceWith(errorMessage);
        expect(snackbarService.addElement).toHaveBeenCalledOnceWith(
          errorMessage,
          true
        );
      });
    });
  });
});
