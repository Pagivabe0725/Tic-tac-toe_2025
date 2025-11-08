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
@Injectable({ providedIn: 'root' })
export class Csrf {

  /** HttpClient that bypasses interceptors (used only to fetch CSRF token) */
  #rawHttp: HttpClient = new HttpClient(inject(HttpBackend));

  /** Writable signal storing the token */
  #token: WritableSignal<string | undefined> = signal(undefined);

  /** Flag indicating ongoing token fetch */
  #loading = false;

  /** Queue of waiting resolvers for concurrent token requests */
  #waiters: ((value: string | undefined) => void)[] = [];

  /** Readonly signal for current token */
  get token() {
    return this.#token.asReadonly();
  }

  /**
   * Ensures a CSRF token is available.
   * Fetches a new token if necessary.
   * 
   * Uses #rawHttp to avoid deadlocks caused by interceptors.
   */
  async ensureToken(): Promise<string | undefined> {
    if (this.#token()) return this.#token();

    if (this.#loading) {
      return new Promise(resolve => this.#waiters.push(resolve));
    }

    this.#loading = true;

    try {
      const res = await firstValueFrom(
        this.#rawHttp.get<{ csrfToken: string }>(`${BASE_URL}/csrf-token`, {
          withCredentials: true,
        }).pipe(take(1))
      );

      this.#token.set(res.csrfToken);
      this.#resolveWaiters(res.csrfToken);
      return res.csrfToken;

    } catch {
      this.#resolveWaiters(undefined);
      return undefined;

    } finally {
      this.#loading = false;
    }
  }

  /** Invalidate current token (e.g., logout or token rotation) */
  invalidate() {
    this.#token.set(undefined);
  }

  /** Resolve queued promises for concurrent token requests */
  #resolveWaiters(value: string | undefined) {
    this.#waiters.forEach(w => w(value));
    this.#waiters = [];
  }
}
