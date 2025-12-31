import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { Http } from '../http.service';
import { BASE_URL } from '../../utils/constants/base-URL.constant';

/**
 * @fileoverview
 * Unit tests for the `Http` service.
 *
 * Covers:
 * - request: GET/POST/PUT/PATCH/DELETE requests
 * - query params handling
 * - retry behavior (exponential backoff)
 * - error handling: returns undefined on failure
 *
 * Notes:
 * - Zoneless environment: no fakeAsync / tick usage.
 * - Retry tests wait for the next request with a small async polling helper.
 */

describe('Http (service)', () => {
  /** Service under test. */
  let service: Http;

  /** Http testing controller for asserting outgoing requests. */
  let httpMock: HttpTestingController;

  /** Small async delay helper for retry tests. */
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Waits until a request matching the predicate appears, or throws after attempts.
   */
  const expectOneEventually = async (
    predicate: (req: any) => boolean,
    attempts = 40,
    intervalMs = 5
  ) => {
    let lastError: unknown;

    for (let i = 0; i < attempts; i++) {
      try {
        return httpMock.expectOne(predicate);
      } catch (e) {
        lastError = e;
        await sleep(intervalMs);
      }
    }

    throw lastError;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [provideZonelessChangeDetection(), Http],
    });

    service = TestBed.inject(Http);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Tests for the `request` public API.
   */
  describe('[request] function:', () => {
    /**
     * Ensures that GET requests are sent to BASE_URL/endpoint and query params are attached.
     */
    it('Should send GET request with query params', async () => {
      const promise = service.request<{ ok: boolean }>(
        'get',
        'test/endpoint',
        null,
        {},
        { a: '1', b: 2, c: true }
      );

      // Match without caring about urlWithParams, then assert params explicitly.
      const req = httpMock.expectOne(
        (r) => r.method === 'GET' && r.url === `${BASE_URL}/test/endpoint`
      );

      expect(req.request.params.get('a')).toBe('1');
      expect(req.request.params.get('b')).toBe('2');
      expect(req.request.params.get('c')).toBe('true');

      req.flush({ ok: true });

      await expectAsync(promise).toBeResolvedTo({ ok: true });
    });

    /**
     * Ensures that POST requests include body and use the correct endpoint.
     */
    it('Should send POST request with body', async () => {
      const body = { hello: 'world' };

      const promise = service.request<{ ok: boolean }>(
        'post',
        'test/post',
        body
      );

      const req = httpMock.expectOne(
        (r) => r.method === 'POST' && r.url === `${BASE_URL}/test/post`
      );

      expect(req.request.body).toEqual(body);

      req.flush({ ok: true });

      await expectAsync(promise).toBeResolvedTo({ ok: true });
    });

    /**
     * Ensures that PUT requests are sent correctly with body.
     */
    it('Should send PUT request', async () => {
      const body = { value: 1 };

      const promise = service.request<{ ok: boolean }>(
        'put',
        'test/put',
        body
      );

      const req = httpMock.expectOne(
        (r) => r.method === 'PUT' && r.url === `${BASE_URL}/test/put`
      );

      expect(req.request.body).toEqual(body);

      req.flush({ ok: true });

      await expectAsync(promise).toBeResolvedTo({ ok: true });
    });

    /**
     * Ensures that PATCH requests are sent correctly with body.
     */
    it('Should send PATCH request', async () => {
      const body = { value: 2 };

      const promise = service.request<{ ok: boolean }>(
        'patch',
        'test/patch',
        body
      );

      const req = httpMock.expectOne(
        (r) => r.method === 'PATCH' && r.url === `${BASE_URL}/test/patch`
      );

      expect(req.request.body).toEqual(body);

      req.flush({ ok: true });

      await expectAsync(promise).toBeResolvedTo({ ok: true });
    });

    /**
     * Ensures that DELETE requests are sent correctly (no body).
     */
    it('Should send DELETE request', async () => {
      const promise = service.request<{ ok: boolean }>('delete', 'test/delete');

      const req = httpMock.expectOne(
        (r) => r.method === 'DELETE' && r.url === `${BASE_URL}/test/delete`
      );

      req.flush({ ok: true });

      await expectAsync(promise).toBeResolvedTo({ ok: true });
    });

    /**
     * Ensures that the request retries after initialDelay when the first attempt fails.
     */
    it('Should retry once after failure (initialDelay)', async () => {
      spyOn(console, 'error'); // suppress noise

      const promise = service.request<{ ok: boolean }>('get', 'test/retry', null, {
        maxRetries: 5,
        initialDelay: 10,
      });

      // First attempt fails
      const req1 = httpMock.expectOne(
        (r) => r.method === 'GET' && r.url === `${BASE_URL}/test/retry`
      );
      req1.flush('err', { status: 500, statusText: 'Server Error' });

      // Second attempt should appear after initialDelay (timer)
      const req2 = await expectOneEventually(
        (r) => r.method === 'GET' && r.url === `${BASE_URL}/test/retry`
      );
      req2.flush({ ok: true });

      await expectAsync(promise).toBeResolvedTo({ ok: true });
    });

    /**
     * Ensures that the request stops retrying after maxRetries and resolves to undefined.
     */
    it('Should return undefined when maxRetries is exceeded', async () => {
      spyOn(console, 'error'); // request logs on failure

      const promise = service.request<{ ok: boolean }>(
        'get',
        'test/retry-limit',
        null,
        { maxRetries: 1, initialDelay: 10 }
      );

      // First attempt fails
      const req1 = httpMock.expectOne(
        (r) => r.method === 'GET' && r.url === `${BASE_URL}/test/retry-limit`
      );
      req1.flush('err', { status: 500, statusText: 'Server Error' });

      // Retry #1 appears after delay, then fails again -> maxRetries exceeded
      const req2 = await expectOneEventually(
        (r) => r.method === 'GET' && r.url === `${BASE_URL}/test/retry-limit`
      );
      req2.flush('err', { status: 500, statusText: 'Server Error' });

      await expectAsync(promise).toBeResolvedTo(undefined);
    });

    /**
     * Ensures that a failing request returns undefined (with no retries).
     */
    it('Should return undefined on request error (no retries)', async () => {
      spyOn(console, 'error');

      const promise = service.request('get', 'test/error', null, {
        maxRetries: 0,
        initialDelay: 1,
      });

      const req = httpMock.expectOne(
        (r) => r.method === 'GET' && r.url === `${BASE_URL}/test/error`
      );
      req.flush('err', { status: 500, statusText: 'Server Error' });

      await expectAsync(promise).toBeResolvedTo(undefined);
      expect(console.error).toHaveBeenCalled();
    });
  });
});
