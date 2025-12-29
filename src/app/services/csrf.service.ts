import { HttpClient, HttpBackend } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { BASE_URL } from '../utils/constants/base-URL.constant';

/**
 * @service Csrf
 *
 * Centralized CSRF token management with concurrency-safe handling.
 *
 * NOTE: This service uses a separate HttpClient (`#rawHttp`) that bypasses
 * interceptors to avoid a **deadlock** situation.
 *
 * Deadlock explanation:
 *  - If we used the normal HttpClient with interceptors, fetching the CSRF token
 *    itself would trigger the interceptor.
 *  - The interceptor calls `ensureToken()` to attach the CSRF token.
 *  - This causes a circular dependency: token fetch waits for itself → deadlock.
 *
 * By using `HttpBackend`, the request for the CSRF token bypasses all interceptors
 * and resolves normally.
 */
/**
 * Centralized CSRF token management with concurrency-safe handling.
 *
 * This service fetches and stores a CSRF token, ensuring:
 *  - Only one token fetch occurs at a time.
 *  - Concurrent requests wait for the first fetch to complete.
 *
 * Note: Uses a separate {@link HttpClient} instance (#rawHttp) that bypasses
 * interceptors to prevent circular dependency deadlocks.
 */
@Injectable({ providedIn: 'root' })
export class Csrf {
  /** HttpClient that bypasses interceptors (used exclusively for token fetch) */
  #rawHttp: HttpClient = new HttpClient(inject(HttpBackend));

  /** Writable signal storing the current CSRF token */
  #token: WritableSignal<string | undefined> = signal(undefined);

  /** Flag indicating if a token fetch is ongoing */
  private loading = false;

  /** Queue of resolvers for concurrent token requests */
  private waiters: ((value: string | undefined) => void)[] = [];

  /** Read-only signal exposing the current token */
  get token() {
    return this.#token.asReadonly();
  }

  /**
   * Ensures a CSRF token is available.
   * Fetches a new token if none exists, otherwise returns the cached one.
   *
   * Uses #rawHttp to avoid interceptor deadlocks.
   *
   * @returns The CSRF token or undefined if fetch fails
   */
  async ensureToken(): Promise<string | undefined> {
    if (this.#token()) return this.#token();

    if (this.loading) {
      return new Promise((resolve) => this.waiters.push(resolve));
    }

    this.loading = true;

    try {
      const res = await firstValueFrom(
        this.#rawHttp
          .get<{ csrfToken: string }>(`${BASE_URL}/csrf-token`, {
            withCredentials: true,
          })
          .pipe(take(1))
      );

      this.#token.set(res.csrfToken);
      this.resolveWaiters(res.csrfToken);
      return res.csrfToken;
    } catch {
      this.resolveWaiters(undefined);
      return undefined;
    } finally {
      this.loading = false;
    }
  }

  /** Invalidate the current token (e.g., on logout or token rotation) */
  invalidate() {
    this.#token.set(undefined);
  }

  /** Resolve queued promises for concurrent token requests */
  private resolveWaiters(value: string | undefined) {
    this.waiters.forEach((w) => w(value));
    this.waiters = [];
  }
}
