
import {
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Http } from './http.service';

/**
 * @interface User
 * Defines the structure of a user object as returned by the backend.
 */
export interface User {
  userId: number;      // Unique user ID
  email: string;       // User email
  winNumber: number;   // Number of wins (game stats)
  loseNumber: number;  // Number of losses (game stats)
}

/**
 * @service Auth
 *
 * Handles authentication logic, including login, signup, logout,
 * session validation, and user state management using Angular signals.
 */
@Injectable({
  providedIn: 'root', // Provides singleton instance app-wide
})
export class Auth {
  /** Injected HTTP service wrapper for requests with retry/error handling */
  #httpHandler: Http = inject(Http);

  /** Writable signal storing the currently logged-in user */
  #user: WritableSignal<User | undefined> = signal(undefined);

  /** Writable signal storing the current CSRF token (if applicable) */
  #CSRF: WritableSignal<string | undefined> = signal(undefined);

  /**
   * Read-only access to the current user signal.
   * Use this to observe user changes without being able to modify directly.
   */
  get user(): Signal<User | undefined> {
    return this.#user.asReadonly();
  }

  /**
   * Setter for updating the current user signal value.
   * Accepts a User object or undefined (to clear user on logout).
   */
  set user(newValue: User | undefined) {
    this.#user.set(newValue);
  }

  /**
   * Read-only access to the current CSRF token signal.
   */
  get csrf(): Signal<string | undefined> {
    return this.#CSRF.asReadonly();
  }

  /**
   * Performs login request to backend with email & password.
   * Uses HTTP service with exponential backoff retry.
   * @returns Promise resolving to User object if successful, otherwise undefined
   */
  async login(email: string, password: string): Promise<User | undefined> {
    return await this.#httpHandler.request<User>(
      'post',
      'users/login', // backend endpoint
      { email, password },
      { maxRetries: 3, initialDelay: 200 } // retry config
    );
  }

  /**
   * Fetches the currently logged-in user from the session.
   * Useful to check if the user is already logged in when app loads.
   * @returns Promise<User | undefined>
   */
  async fetchCurrentSessionUser(): Promise<User | undefined> {
    return await this.#httpHandler.request<User>(
      'post',
      'users/check/session',
      null
    );
  }

  /**
   * Performs logout by calling backend endpoint.
   * Converts the response to boolean if available.
   * @returns Promise<boolean | undefined>
   */
  async logout(): Promise<boolean | undefined> {
    return (
      (
        await this.#httpHandler.request<{ result: boolean }>(
          'post',
          'users/logout',
          null
        )
      )?.result ?? undefined
    );
  }

  /**
   * Performs signup of a new user.
   * Sends email, password, and confirmed password.
   * Uses HTTP service with retry to handle transient errors.
   * @returns Promise<{ userId: string } | undefined>
   */
  async singup(
    email: string,
    password: string,
    rePassword: string
  ): Promise<{ userId: string } | undefined> {
    return await this.#httpHandler.request<{ userId: string }>(
      'post',
      'users/signup',
      {
        email: email,
        password: password,
        confirmPassword: rePassword,
      },
      { maxRetries: 5, initialDelay: 200 }
    );
  }

  /**
   * Sets the current user signal if a valid session exists.
   * Useful to initialize user state on app startup.
   */
  async setCurrentUserIfExist(): Promise<void> {
    this.user = await this.fetchCurrentSessionUser();
    console.log(this.user());
  }

  /**
   * Checks if an email is already used.
   * @param email Email to check
   * @returns Promise<boolean> True if email exists, false otherwise
   */
  async isUsedEmail(email: string): Promise<boolean> {
    const response = await this.#httpHandler.request<{ result: boolean }>(
      'post',
      'users/is-used-email',
      { email },
      { maxRetries: 3, initialDelay: 300 }
    );

    if (!response) return false; // fallback if request fails
    return response.result;
  }
}
