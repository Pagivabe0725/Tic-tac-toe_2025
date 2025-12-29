import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { RedirectCommand, Router, UrlTree } from '@angular/router';

import { accountGuard } from './account-guard';
import { Auth } from '../services/auth.service'; 

/**
 * @fileoverview
 * Unit tests for the `accountGuard` CanMatchFn.
 *
 * Covers:
 * - Returns true when user exists
 * - Returns RedirectCommand to `/not-found` when user does not exist
 * - Calls `auth.setCurrentUserIfExist()` before returning
 */

describe('accountGuard', () => {
  /** Auth dependency mock. */
  let authMock: {
    setCurrentUserIfExist: jasmine.Spy;
    user: jasmine.Spy;
  };

  /** Router dependency mock. */
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authMock = {
      setCurrentUserIfExist: jasmine
        .createSpy('setCurrentUserIfExist')
        .and.resolveTo(undefined),
      user: jasmine.createSpy('user'),
    };

    routerMock = jasmine.createSpyObj<Router>('Router', ['parseUrl']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Auth, useValue: authMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  describe('Behavior:', () => {
    /**
     * Ensures the guard allows matching when a current user exists.
     */
    it('Should return true when user exists', async () => {
      authMock.user.and.returnValue({ id: '1' });

      const result = await TestBed.runInInjectionContext(() =>
        accountGuard({} as any, {} as any)
      );

      expect(authMock.setCurrentUserIfExist).toHaveBeenCalled();
      expect(result).toBeTrue();
    });

    /**
     * Ensures the guard redirects to `/not-found` when no user exists.
     */
    it('Should return RedirectCommand when user does not exist', async () => {
      const fakeTree = {} as UrlTree;

      authMock.user.and.returnValue(null);
      routerMock.parseUrl.and.returnValue(fakeTree);

      const result = await TestBed.runInInjectionContext(() =>
        accountGuard({} as any, {} as any)
      );

      expect(authMock.setCurrentUserIfExist).toHaveBeenCalled();
      expect(routerMock.parseUrl).toHaveBeenCalledWith('/not-found');

      expect(result instanceof RedirectCommand).toBeTrue();
      expect((result as RedirectCommand).redirectTo).toBe(fakeTree);
      expect((result as RedirectCommand).navigationBehaviorOptions).toBeUndefined();
    });
  });
});
