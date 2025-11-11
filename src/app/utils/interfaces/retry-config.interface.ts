/**
 * Configuration object for controlling retry behavior of HTTP requests.
 *
 * This interface is used in the `Http` service to define:
 *  - How many times a failed request should be retried (`maxRetries`)
 *  - How long to wait before the first retry attempt (`initialDelay`)
 *
 * Both fields are optional; defaults are applied in the `Http` service methods:
 *  - `maxRetries` defaults to 5
 *  - `initialDelay` defaults to 200ms
 */
export interface retryConfig {
  /**
   * Maximum number of retry attempts if an HTTP request fails.
   * Each retry uses exponential backoff: delay = initialDelay * 2^attemptNumber
   * @default 5
   */
  maxRetries?: number;

  /**
   * Initial delay (in milliseconds) before the first retry attempt.
   * Subsequent retries double this delay (exponential backoff)
   * @default 200
   */
  initialDelay?: number;
}
