import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  QueryParamsHandling,
  Router,
} from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { RouterService } from '../router.service';

/**
 * @fileoverview
 * Unit tests for the `RouterService`.
 *
 * Covers:
 * - Signals:
 *   - currentEndpoint updates on NavigationEnd
 *   - queryParams updates from the innermost ActivatedRoute
 *   - subscriptions are cleaned up on injector destroy
 * - navigateTo:
 *   - forwards navigation with optional queryParams and queryParamsHandling
 */

describe('RouterService', () => {
  /** Service under test. */
  let service: RouterService;

  /** Router events stream mock. */
  let routerEvents$: Subject<any>;

  /** Query params subject for the innermost route. */
  let leafQueryParams$: BehaviorSubject<Params>;

  /** Router mock. */
  let routerMock: jasmine.SpyObj<Router> & {
    events: Subject<any>;
    routerState: { root: ActivatedRoute };
  };

  beforeEach(() => {
    routerEvents$ = new Subject<any>();
    leafQueryParams$ = new BehaviorSubject<Params>({});

    // Build ActivatedRoute chain: root -> child -> leaf
    const leafRoute = {
      firstChild: null,
      queryParams: leafQueryParams$.asObservable(),
    } as unknown as ActivatedRoute;

    const childRoute = {
      firstChild: leafRoute,
      queryParams: new BehaviorSubject<Params>({ child: true }).asObservable(),
    } as unknown as ActivatedRoute;

    const rootRoute = {
      firstChild: childRoute,
      queryParams: new BehaviorSubject<Params>({ root: true }).asObservable(),
    } as unknown as ActivatedRoute;

    routerMock = Object.assign(
      jasmine.createSpyObj<Router>('Router', ['navigate']),
      {
        events: routerEvents$,
        routerState: { root: rootRoute },
      }
    );

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        RouterService,
        { provide: Router, useValue: routerMock },
      ],
    });

    spyOn(console, 'log'); // silence service logging

    service = TestBed.inject(RouterService);
  });

  /**
   * Tests for reactive tracking signals.
   */
  describe('Signals:', () => {
    /**
     * Ensures default values are exposed before any navigation.
     */
    it('Should expose default signal values', () => {
      expect(service.currentEndpoint()).toBeUndefined();
      expect(service.queryParams()).toEqual({});
    });

    /**
     * Ensures that NavigationEnd updates currentEndpoint (without query string, without leading slash).
     */
    it('Should update currentEndpoint on NavigationEnd', () => {
      routerEvents$.next(
        new NavigationEnd(1, '/test/endpoint?a=1', '/test/endpoint?a=1')
      );

      expect(service.currentEndpoint()).toBe('test/endpoint');
    });

    /**
     * Ensures that queryParams are taken from the innermost ActivatedRoute (leaf) after NavigationEnd.
     */
    it('Should update queryParams from the innermost ActivatedRoute', () => {
      routerEvents$.next(new NavigationEnd(1, '/any', '/any'));

      leafQueryParams$.next({ a: '1', b: 2 });

      expect(service.queryParams()).toEqual({ a: '1', b: 2 });
    });

    /**
     * Ensures that subscriptions are cleaned up when the injector is destroyed.
     */
    it('Should stop reacting after injector destroy', () => {
      routerEvents$.next(new NavigationEnd(1, '/first', '/first'));
      expect(service.currentEndpoint()).toBe('first');

      // Destroy the TestBed injector -> DestroyRef callbacks should run -> unsubscribe happens.
      TestBed.resetTestingModule();

      // Try to push another navigation and param change
      routerEvents$.next(new NavigationEnd(2, '/second', '/second'));
      leafQueryParams$.next({ z: '9' });

      // Should remain unchanged if subscription was cleaned up
      expect(service.currentEndpoint()).toBe('first');
    });
  });

  /**
   * Tests for navigation helper.
   */
  describe('[navigateTo] function:', () => {
    /**
     * Ensures that navigation is forwarded without optional params when not provided.
     */
    it('Should call router.navigate with only the path when no params are provided', () => {
      service.navigateTo(['home']);

      expect(routerMock.navigate).toHaveBeenCalledOnceWith(['home'], {});
    });

    /**
     * Ensures that queryParams are forwarded (as a shallow copy) when provided.
     */
    it('Should call router.navigate with queryParams when provided', () => {
      const queryParams: Params = { a: 1, b: '2' };

      service.navigateTo(['search'], queryParams);

      const [, options] = routerMock.navigate.calls.mostRecent().args;

      expect(options!.queryParams).toEqual({ a: 1, b: '2' });
      expect(options!.queryParams).not.toBe(queryParams);
    });

    /**
     * Ensures that queryParamsHandling is forwarded when provided.
     */
    it('Should call router.navigate with queryParamsHandling when provided', () => {
      const handling: QueryParamsHandling = 'merge';

      service.navigateTo(['search'], { q: 'x' }, handling);

      expect(routerMock.navigate).toHaveBeenCalledOnceWith(['search'], {
        queryParams: { q: 'x' },
        queryParamsHandling: 'merge',
      });
    });
  });
});
