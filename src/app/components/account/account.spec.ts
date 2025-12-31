/**
 * Test suite for the `Account` component.
 *
 * Focuses on:
 * - Verifying effects triggered by changes in signals (user, queryParams)
 * - Component method behavior for order parsing and GraphQL query construction
 * - Handling of HTTP responses for loading saved games
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Account } from './account';
import {
  provideZonelessChangeDetection,
  signal,
  WritableSignal,
} from '@angular/core';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Http } from '../../services/http.service';
import { Auth } from '../../services/auth.service';
import { User } from '../../utils/interfaces/user.interface';
import {
  createGame,
  createUser,
} from '../../utils/test/functions/creators.functions';
import { SavedGame } from '../../utils/interfaces/saved-game.interface';
import {
  generateRandomStatus,
  randomBetween,
  randomNumber,
} from '../../utils/test/functions/random-values.function';
import { SAVED_GAME_STATUSES } from '../../utils/constants/saved-game-status.constant';
import { RouterService } from '../../services/router.service';
import { Params } from '@angular/router';
import { GameOrder } from '../../utils/types/order.type';
import { ORDERS } from '../../utils/constants/order.constant';
import { modifyGameInfo } from '../../store/actions/game-info-modify.action';

/**
 * @fileoverview
 * Unit tests for the Account component.
 *
 * Covers:
 * - Effects reacting to Auth.user signal changes
 * - QueryParams updates for page, order, filter
 * - Component methods: splitOrder, createGamesQueryBody, loadSavedGames
 * - HTTP response handling and signal updates
 * Includes inline comments for logic clarity.
 */

describe('Account', () => {
  /** The Account component instance under test */
  let component: Account;

  /** Angular test fixture for the Account component */
  let fixture: ComponentFixture<Account>;

  /** Mock store instance used for dispatching and selecting state */
  let store: MockStore;

  /** The user object used in tests, provided via mock Auth service */
  let actualUser: User;

  /** Array of SavedGame objects used to simulate user's saved games */
  let savedGames: SavedGame[];

  /** RouterService instance used to spy on navigation calls */
  let routerService: RouterService;

  /** Auth service instance used to manage and spy on user signal */
  let authService: Auth;

  /** Http service instance used to simulate HTTP requests */
  let httpService: Http;

  beforeEach(async () => {
    /** Initialize mock user data */
    actualUser = createUser(true);

    /** Mock Auth service exposing a signal-based user */
    class MockUser {
      user: WritableSignal<User | undefined> = signal(actualUser);
    }

    /** Prepare a list of saved games */
    savedGames = [];
    for (let i = 0; i < randomBetween(1, 9); i++) {
      savedGames.push(createGame(`gameId${i}`, '1', generateRandomStatus()));
    }

    /** Mock Http service returning the saved games */
    class MockHttp {
      request = async () => {
        return {
          data: {
            games: {
              games: savedGames,
              count: savedGames.length,
            },
          },
        };
      };
    }

    await TestBed.configureTestingModule({
      imports: [Account, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideMockStore({ initialState: { gameInfo: {} } }),
        { provide: Http, useFactory: () => new Http() }, // Default Http service
        { provide: Auth, useClass: MockUser }, // Mock user signal
        { provide: Http, useClass: MockHttp }, // Override Http for test responses
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Account);
    component = fixture.componentInstance;

    /** Inject store, router, auth, and http services */
    store = TestBed.inject(MockStore);
    routerService = TestBed.inject(RouterService);
    authService = TestBed.inject(Auth);
    httpService = TestBed.inject(Http);

    fixture.detectChanges(); // Trigger initial change detection
    await fixture.whenStable(); // Wait for async effects
  });

  /** Tests focusing on first effect: navigating when user is undefined */
  describe('First Effect:', () => {
    it('Should call [navigateTo] function of `RouterService` when `user` is undefined', async () => {
      spyOn(routerService, 'navigateTo');

      /** Simulate user becoming undefined */
      (authService.user as WritableSignal<User | undefined>).set(undefined);

      await fixture.whenStable(); // Wait for effect to run

      expect(routerService.navigateTo).toHaveBeenCalledOnceWith([
        'tic-tac-toe',
      ]);
    });

    it('Should not call [navigateTo] function of `RouterService` when `user` is not undefined', async () => {
      spyOn(routerService, 'navigateTo');

      await fixture.whenStable(); // Wait for any effect

      /** Navigation should not be triggered */
      expect(routerService.navigateTo).not.toHaveBeenCalled();
    });
  });

  /** Tests focusing on second effect: updating page/order/filter on queryParams changes */
  describe('Second Effect:', () => {
    it('Should update page, order, and filter signals when queryParams change', async () => {
      /** Simulate router query params change */
      (routerService.queryParams as WritableSignal<Params>).set({
        page: '23',
        order: 'time-asc',
        filter: 'won',
      });

      await fixture.whenStable(); // Wait for effect to update signals

      /** Verify that component signals were updated correctly */
      expect(component['page']()).toBe(23);
      expect(component['order']()).toBe('time-asc');
      expect(component['filter']()).toBe('won');
    });
  });

  /**
   * Tests related to the ngOnInit lifecycle hook.
   *
   * Focus: verifying that the component initializes its state correctly
   * by resetting the winner information in the store.
   */
  describe('[ngOnInit]:', () => {
    /**
     * Ensures that on component initialization:
     * - a store dispatch is triggered
     * - the winner state is explicitly reset to undefined
     *
     * This prevents stale winner data from leaking into a new game session.
     */
    it('Should reset winner state on component initialization', () => {
      // Spy on the NgRx store dispatch method
      spyOn(store, 'dispatch');

      // Manually invoke ngOnInit lifecycle hook
      component['ngOnInit']();

      // Expect a specific action to be dispatched with a cleared winner state
      expect(store.dispatch).toHaveBeenCalledOnceWith(
        modifyGameInfo({ winner: undefined })
      );
    });
  });

  /** Component method tests */
  describe('Component methods:', () => {
    /** Tests for splitOrder parsing behavior */
    describe('[splitOrder]:', () => {
      it('Should return an object with order set to `desc`', () => {
        let order: GameOrder | undefined;
        while (!order) {
          const generatedOrder = ORDERS[randomNumber(ORDERS.length)];
          if (generatedOrder.includes('desc')) order = generatedOrder;
        }

        /** Inline check: ensure order is correctly identified as 'desc' */
        expect(component['splitOrder'](order).order).toBe('desc');
      });

      it('Should return an object with order set to `asc`', () => {
        let order: GameOrder | undefined;
        while (!order) {
          const generatedOrder = ORDERS[randomNumber(ORDERS.length)];
          if (generatedOrder.includes('asc')) order = generatedOrder;
        }

        /** Inline check: ensure order is correctly identified as 'asc' */
        expect(component['splitOrder'](order).order).toBe('asc');
      });

      it('Should return an object with field set to `updatedAt`', () => {
        let order: GameOrder | undefined;
        while (!order) {
          const generatedOrder = ORDERS[randomNumber(ORDERS.length)];
          if (generatedOrder.includes('time')) order = generatedOrder;
        }

        /** Field should correspond to last update time */
        expect(component['splitOrder'](order).field).toBe('updatedAt');
      });

      it('Should return an object with field set to `name`', () => {
        let order: GameOrder | undefined;
        while (!order) {
          const generatedOrder = ORDERS[randomNumber(ORDERS.length)];
          if (generatedOrder.includes('alpha')) order = generatedOrder;
        }

        /** Field should correspond to alphabetical sorting */
        expect(component['splitOrder'](order).field).toBe('name');
      });

      it('Should default to field "updatedAt" for unrecognized order prefix', () => {
        const order = 'invalid-desc';
        /** Default behavior for invalid order string */
        expect(component['splitOrder'](order as GameOrder).field).toBe(
          'updatedAt'
        );
      });

      it('Should return default field and order for completely invalid order string', () => {
        const order = 'invalidOrder';
        expect(component['splitOrder'](order as GameOrder)).toEqual({
          field: 'updatedAt',
          order: 'desc', // default order
        });
      });

      it('Should default to `desc` if order direction is invalid', () => {
        const order = 'time-esc';
        const order2 = 'alpha-esc';

        /** Invalid order directions fallback to 'desc' */
        expect(component['splitOrder'](order as GameOrder)).toEqual({
          field: 'updatedAt',
          order: 'desc',
        });
        expect(component['splitOrder'](order2 as GameOrder)).toEqual({
          field: 'name',
          order: 'desc',
        });
      });
    });

    /** Tests for createGamesQueryBody method */
    describe('[createGamesQueryBody]:', () => {
      it('Should return the correct GraphQL query object', () => {
        const userId = 'userId' + randomNumber(100);
        const page = randomNumber(100);
        const order = ORDERS[randomNumber(ORDERS.length)];
        const status =
          SAVED_GAME_STATUSES[randomNumber(SAVED_GAME_STATUSES.length)];

        const orderElements = component['splitOrder'](order);
        const query = component['createGamesQueryBody'](
          userId,
          page,
          order,
          status
        );

        /** Inline verification of GraphQL query structure */
        expect(query).toEqual({
          query: `
        query games($userId: ID!, $page: Int!, $order: Order, $orderField: OrderField!, $status: GameStatus) {
          games(userId: $userId, page: $page, order: $order, orderField: $orderField, status: $status) {
            count
            games {
              gameId
              name
              lastMove { row column }
              status
              userId
              createdAt
              updatedAt
              board
              difficulty
              size
              opponent
            }
          }
        }
      `,
          variables: {
            userId,
            page,
            order: orderElements.order,
            orderField: orderElements.field,
            status,
          },
        });
      });
    });

    /** Tests for loadSavedGames method handling HTTP responses */
    describe('[loadSavedGames]:', () => {
      it('Should handle the invalid http response', async () => {
        spyOn(httpService, 'request').and.returnValue(
          Promise.resolve(undefined)
        );

        await component['loadSavedGames']();

        /** Signals should reflect empty/undefined state */
        expect(component['pageCount']()).toBe(0);
        expect(component['savedGames']()).toBe(undefined);
      });

      it('Should update savedGames and pageCount correctly for valid response', async () => {
        const newSavedGames: SavedGame[] = [];
        const length = randomNumber(100);
        for (let i = 0; i < length; i++) {
          newSavedGames.push(
            createGame(`gameId${i}`, '1', generateRandomStatus())
          );
        }

        spyOn(httpService, 'request').and.returnValue(
          Promise.resolve({
            data: {
              games: {
                games: newSavedGames,
                count: newSavedGames.length,
              },
            },
          })
        );

        await component['loadSavedGames']();

        /** Signals should now reflect the loaded saved games */
        expect(component['savedGames']()).toEqual(newSavedGames);
        expect(component['pageCount']()).toBe(
          Math.ceil(newSavedGames.length / 10)
        ); // 10 items per page
      });
    });
  });
});
