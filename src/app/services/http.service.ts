import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BASE_URL } from '../utils/constants/base-URL.constant';
import {
  catchError,
  firstValueFrom,
  mergeMap,
  Observable,
  retryWhen,
  take,
  throwError,
  timer,
} from 'rxjs';
import { retryConfig } from '../utils/interfaces/retry-config.interface';

/**
 * @service Http
 *
 * Angular HTTP service with:
 *  - Support for all standard HTTP methods: GET, POST, PUT, DELETE, PATCH
 *  - Generic typing for request and response bodies
 *  - Query parameter handling
 *  - Exponential backoff retry strategy with configurable max retries and initial delay
 *  - Centralized error logging
 *
 * Usage:
 *  - Use `request<T>()` for generic async calls with built-in retry and error handling.
 *  - Retry behavior can be customized per-request via `retryConfig`.
 *
 * Design notes:
 *  - Uses `HttpClient` for standard requests.
 *  - Wraps observables with `firstValueFrom` and `take(1)` to convert to a Promise.
 *  - Exponential backoff implemented via `retryWhen` and `timer`.
 *  - Errors are logged to console and re-thrown for optional handling by callers.
 */
@Injectable({
  providedIn: 'root',
})
export class Http {
  /** Injected Angular HttpClient instance */
  #http: HttpClient = inject(HttpClient);

  /**
   * Creates an operator for retrying failed requests with exponential backoff.
   * 
   * @param maxRetries Maximum number of retry attempts (default: 5)
   * @param initialDelay Initial delay in milliseconds before the first retry (default: 200ms)
   * @returns RxJS operator function that can be piped into an observable
   * 
   * Behavior:
   *  - Each subsequent retry delay is doubled (2^i * initialDelay)
   *  - If maxRetries is exceeded, the original error is re-thrown
   */
  private exponentialBackoffRetry<T>(
    maxRetries: number = 5,
    initialDelay: number = 200
  ): (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) =>
      source.pipe(
        retryWhen((errors) =>
          errors.pipe(
            mergeMap((error, i) => {
              if (i >= maxRetries) {
                return throwError(() => error); // Maximum retries reached
              }
              const delayTime = initialDelay * Math.pow(2, i);
              // Wait delayTime before next retry
              return timer(delayTime);
            })
          )
        )
      );
  }

  /**
   * Prepares an HTTP request observable.
   * 
   * @param method HTTP method
   * @param URL Endpoint relative to BASE_URL
   * @param body Optional request body
   * @param retryConfig Optional per-request retry config
   * @param queryParams Optional query parameters
   * @returns Observable<T> representing the HTTP request
   * 
   * Notes:
   *  - Adds query parameters to the request if provided
   *  - Pipes in exponential backoff retry and error handling
   *  - Supports all standard REST methods
   */
  private setupRequest<T>(
    method: 'post' | 'get' | 'put' | 'delete' | 'patch',
    URL: string,
    body: object | null = null,
    retryConfig: retryConfig = {},
    queryParams?: Record<string, string | number | boolean>
  ): Observable<T> {
    let params: HttpParams | undefined;
    if (queryParams) {
      params = new HttpParams({ fromObject: queryParams as any });
    }

    let result: Observable<T>;

    switch (method) {
      case 'post':
        result = this.#http.post<T>(`${BASE_URL}/${URL}`, body, { params });
        break;
      case 'get':
        result = this.#http.get<T>(`${BASE_URL}/${URL}`, { params });
        break;
      case 'put':
        result = this.#http.put<T>(`${BASE_URL}/${URL}`, body, { params });
        break;
      case 'delete':
        result = this.#http.delete<T>(`${BASE_URL}/${URL}`, { params });
        break;
      case 'patch':
        result = this.#http.patch<T>(`${BASE_URL}/${URL}`, body, { params });
        break;
    }

    // Pipe in retry logic and error logging
    return result.pipe(
      this.exponentialBackoffRetry(
        retryConfig.maxRetries ?? 5,
        retryConfig.initialDelay ?? 200
      ),
      catchError((error) => {
        console.error('Request error: ', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Sends an HTTP request and converts the observable to a Promise.
   * 
   * @param method HTTP method
   * @param URL Endpoint relative to BASE_URL
   * @param body Optional request body
   * @param retryConfig Optional retry configuration
   * @param queryParams Optional query parameters
   * @returns Promise resolving to the response type T
   * 
   * Notes:
   *  - Uses firstValueFrom + take(1) to handle observable completion
   */
  private async sendRequest<T>(
    method: 'post' | 'get' | 'put' | 'delete' | 'patch',
    URL: string,
    body: object | null = null,
    retryConfig: retryConfig = {},
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T> {
    return await firstValueFrom(
      this.setupRequest<T>(method, URL, body, retryConfig, queryParams).pipe(
        take(1)
      )
    );
  }

  /**
   * Public method for making HTTP requests with built-in retry and error handling.
   * 
   * @param method HTTP method
   * @param URL Endpoint relative to BASE_URL
   * @param body Optional request body
   * @param retryConfig Optional retry configuration
   * @param queryParams Optional query parameters
   * @returns Promise<T | undefined>
   * 
   * Notes:
   *  - Returns undefined if the request ultimately fails
   *  - Logs errors to the console
   *  - Use generic typing to keep type-safety for responses
   */
  async request<T>(
    method: 'post' | 'get' | 'put' | 'delete' | 'patch',
    URL: string,
    body: object | null = null,
    retryConfig: retryConfig = {},
    queryParams?: Record<string, string | number | boolean>
  ): Promise<T | undefined> {
    try {
      return await this.sendRequest<T>(
        method,
        URL,
        body,
        retryConfig,
        queryParams
      );
    } catch (error) {
      console.error(`HTTP request failed: ${error}`);
      return undefined;
    }
  }
}
