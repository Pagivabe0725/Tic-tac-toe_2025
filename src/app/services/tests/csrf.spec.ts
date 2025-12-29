import { TestBed } from '@angular/core/testing';

import { Csrf } from '../csrf.service';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import {
  randomBetween,
  randomNumber,
} from '../../utils/test/functions/random-values.function';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../utils/constants/base-URL.constant';

/**
 * @fileoverview
 * Unit tests for the Csrf service.
 *
 * This suite verifies the functionality of the Csrf service, including:
 * - Token retrieval via `ensureToken()`
 * - Handling of concurrent requests
 * - Caching behavior to avoid redundant HTTP calls
 * - Proper error handling when requests fail
 * - Token invalidation via `invalidate()`
 * - Resolving queued promises via `resolveWaiters()`
 *
 * The tests use Angular's HttpClientTestingModule and HttpTestingController
 * to mock backend interactions. Jasmine spies are employed for HTTP method
 * interception and verification.
 *
 * Scenarios covered:
 * - Valid and invalid token responses
 * - Queuing multiple calls while a token is loading
 * - Returning cached tokens immediately
 * - Ensuring invalidated tokens are properly refreshed
 */

describe('Csrf (service)', () => {
  /** The Csrf service instance under test. */
  let service: Csrf;

  /** Raw HttpClient for low-level requests. */
  let rawHttp: HttpClient;

  /** HttpTestingController for mocking HTTP requests. */
  let httpMock: HttpTestingController;

  /** The expected CSRF token used in tests. */
  let expectedToken: string;

  /** Spy for HTTP requests. */
  let requestSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection()],
    });

    service = TestBed.inject(Csrf);
    rawHttp = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);

    expectedToken = '';
    for (let i = 0; i < randomBetween(5, 20); i++) {
      expectedToken += randomNumber(10).toString();
    }
  });

  /**
   * Tests for the ensureToken method.
   *
   * Verifies token retrieval, caching, and concurrent requests.
   */
  describe('[ensureToken] function:', () => {
    /**
     * Ensures that a valid backend response sets the token correctly.
     */
    it('Should set token if response is valid', async () => {
      const promise = service.ensureToken();

      const req = httpMock.expectOne(`${BASE_URL}/csrf-token`);
      expect(req.request.withCredentials).toBeTrue();

      req.flush({ csrfToken: expectedToken });

      const token = await promise;
      expect(token).toBe(expectedToken.toString());
    });

    /**
     * Ensures that an HTTP error results in undefined token.
     */
    it('Should return undefined if token request fails', async () => {
      const promise = service.ensureToken();

      const req = httpMock.expectOne(`${BASE_URL}/csrf-token`);
      req.error(new ProgressEvent('Network error'), {
        status: 500,
        statusText: 'Server Error',
      });

      const token = await promise;
      expect(token).toBeUndefined();
    });

    /**
     * Ensures that concurrent calls to ensureToken
     * are queued while the token is loading.
     */
    it('Should queue concurrent ensureToken calls while loading is true', async () => {
      const firstPromise = service.ensureToken();
      const secondPromise = service.ensureToken();

      const req = httpMock.expectOne(`${BASE_URL}/csrf-token`);
      httpMock.verify();

      req.flush({ csrfToken: expectedToken });

      const [firstResult, secondResult] = await Promise.all([
        firstPromise,
        secondPromise,
      ]);

      expect(firstResult).toBe(expectedToken.toString());
      expect(secondResult).toBe(expectedToken.toString());
    });

    /**
     * Ensures that the token is returned immediately
     * if it has already been cached.
     */
    it('Should return cached token immediately if already available', async () => {
      const firstPromise = service.ensureToken();
      const req = httpMock.expectOne(`${BASE_URL}/csrf-token`);
      req.flush({ csrfToken: expectedToken });

      expect(await firstPromise).toBe(expectedToken.toString());

      const secondResult = await service.ensureToken();
      expect(secondResult).toBe(expectedToken.toString());

      httpMock.expectNone(`${BASE_URL}/csrf-token`);
    });
  });

  /**
   * Tests for the resolveWaiters method.
   *
   * Ensures that all queued promises are resolved with the token value.
   */
  describe('[resolveWaiters] function:', () => {
    /**
     * Ensures that queued promises waiting for the token
     * are resolved once the token is available.
     */
    it('Should resolve all queued waiters with the provided value', async () => {
      const firstPromise = service.ensureToken();
      const secondPromise = service.ensureToken();

      const req = httpMock.expectOne(`${BASE_URL}/csrf-token`);
      httpMock.verify();

      req.flush({ csrfToken: expectedToken });

      const [firstResult, secondResult] = await Promise.all([
        firstPromise,
        secondPromise,
      ]);

      expect(firstResult).toBe(expectedToken.toString());
      expect(secondResult).toBe(expectedToken.toString());

      expect(service['waiters'].length).toBe(0);
    });
  });

  /**
   * Tests for the invalidate method.
   *
   * Ensures token invalidation and subsequent refresh behavior.
   */
  describe('[invalidate] function:', () => {
    /**
     * Ensures that calling invalidate removes the current token
     * and allows fetching a new token from the backend.
     */
    it('Should invalidate the token', async () => {
      const firstPromise = service.ensureToken();
      const req = httpMock.expectOne(`${BASE_URL}/csrf-token`);
      req.flush({ csrfToken: expectedToken });

      const firstResult = await firstPromise;
      expect(firstResult).toBe(expectedToken.toString());
      expect(service.token()).toBe(expectedToken.toString());

      // Invalidate the token
      service.invalidate();
      expect(service.token()).toBeUndefined();

      // Ensure a new token is fetched after invalidation
      const secondPromise = service.ensureToken();
      const secondReq = httpMock.expectOne(`${BASE_URL}/csrf-token`);
      secondReq.flush({ csrfToken: expectedToken });

      const secondResult = await secondPromise;
      expect(secondResult).toBe(expectedToken.toString());
    });
  });
});
