import {
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Http } from './http.service';
import { User } from '../utils/interfaces/user.interface';

/**
 * @service Auth
 *
 * Handles authentication and user state management.
 * Uses Angular signals for reactive state and interacts with the backend
 * via {@link Http} for login, signup, logout, session validation, and user updates.
 */
@Injectable({
  providedIn: 'root', // singleton instance for the entire app
})
export class Auth {
  /** Injected HTTP service wrapper for making backend requests */
  #httpHandler: Http = inject(Http);

  /** Writable signal storing the currently logged-in user */
  #user: WritableSignal<User | undefined> = signal(undefined);

  /**
   * Read-only access to the current user signal.
   * Allows observing changes without direct mutation.
   */
  get user(): Signal<User | undefined> {
    return this.#user.asReadonly();
  }

  /**
   * Setter for updating the current user signal value.
   * Accepts a User object or undefined (for logout or clearing state).
   */
  set user(newValue: User | undefined) {
    this.#user.set(newValue);
  }


  /**
   * Logs in a user with email and password.
   * @param email User email
   * @param password User password
   * @returns Promise resolving to a User object if successful, undefined otherwise
   */
  async login(email: string, password: string): Promise<User | undefined> {
    return await this.#httpHandler.request<User>(
      'post',
      'users/login',
      { email, password },
      { maxRetries: 3, initialDelay: 200 }
    );
  }

  /**
   * Checks the current session for an authenticated user.
   * @returns Promise resolving to the current User or undefined if no session exists
   */
  private async fetchCurrentSessionUser(): Promise<User | undefined> {
    const result = await this.#httpHandler.request<{ user: User | undefined }>(
      'post',
      'users/check-session',
      null
    );
    return result?.user ?? undefined;
  }

  /**
   * Logs out the current user.
   * Calls backend logout endpoint and clears the user signal.
   * @returns Promise resolving to true if logout succeeded, undefined otherwise
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
   * Signs up a new user.
   * Sends email, password, and confirmation password to backend.
   * @param email User email
   * @param password User password
   * @param rePassword Confirmation password
   * @returns Promise resolving to { userId: string } if successful, undefined otherwise
   */
  async signup(
    email: string,
    password: string,
    rePassword: string
  ): Promise<{ userId: string } | undefined> {
    return await this.#httpHandler.request<{ userId: string }>(
      'post',
      'users/signup',
      { email, password, confirmPassword: rePassword },
      { maxRetries: 5, initialDelay: 200 }
    );
  }

  /**
   * Initializes the user signal if a valid session exists.
   * Useful on app startup to restore the logged-in state.
   */
  async setCurrentUserIfExist(): Promise<void> {
    this.user = await this.fetchCurrentSessionUser();
  }

  /**
   * Checks whether an email is already registered.
   * @param email Email to verify
   * @returns Promise resolving to true if email exists, false otherwise
   */
  async isUsedEmail(email: string): Promise<boolean> {
    const response = await this.#httpHandler.request<{ result: boolean }>(
      'post',
      'users/is-used-email',
      { email },
      { maxRetries: 3, initialDelay: 300 }
    );

    if (!response) return false;
    return response.result;
  }

  /**
   * Updates the local user signal by merging new properties and
   * sends a PATCH request to persist the changes on the backend.
   *
   * @param {Partial<User>} newUser - The user properties to update.
   * @returns {Promise<void>} Resolves when the server request completes.
   */
  async updateUser(newUser: Partial<User>): Promise<void> {
    this.#user.update((previous) => {
      if (!previous) return undefined;
      return { ...previous, ...newUser };
    });

    await this.#httpHandler.request<User>(
      'patch',
      'users/update-user',
      { ...this.#user() },
      { maxRetries: 3, initialDelay: 200 }
    );
  }

}
