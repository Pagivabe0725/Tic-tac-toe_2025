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
import { SnackBarHandler } from './snack-bar-handler.service';

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
   * Service responsible for managing snackbar state and behavior
   * (e.g. ticking, adding, and removing snackbar elements).
   */
  #snackbarHandler: SnackBarHandler = inject(SnackBarHandler);

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
      null,
      {
        initialDelay: 50,
        maxRetries: 3,
      }
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
   * Sends a PATCH request to update the current user on the backend and,
   * on success, merges the provided properties into the local user signal.
   *
   * If the request fails, an error snackbar message is displayed and
   * the local user state remains unchanged.
   *
   * @param {Partial<User>} newUser - Partial user properties to be merged into the current user state.
   * @returns {Promise<void>} Resolves after the update attempt completes.
   */

  async updateUser(newUser: Partial<User>): Promise<void> {
    const newUserFromResponse = await this.#httpHandler.request<User>(
      'patch',
      'users/update-user',
      { ...this.#user() },
      { maxRetries: 3, initialDelay: 200 }
    );

    if (newUserFromResponse) {
      this.#user.update((previous) => {
        if (!previous) return undefined;
        return { ...previous, ...newUser };
      });
    } else {
      this.#snackbarHandler.addElement('Failed to update user', true);
    }
  }

  /**
   * Retrieves a user by their unique identifier and updates
   * the local user signal with the fetched user data.
   *
   * This method sends a request to the backend to fetch a user using
   * the provided userId, then stores the result in the internal
   * writable signal for reactive state updates.
   *
   * @param userId - The unique identifier of the user to retrieve.
   */
  async setUserById(userId: string): Promise<void> {
    const user = await this.#httpHandler.request<User>(
      'post',
      'users/get-user-by-identifier',
      { userId }
    );
    if (user) this.#user.set(user);
  }

  /**
   * Validates whether the given password matches the currently
   * logged-in user's stored password.
   *
   * If no user is available in the local signal, the method
   * returns `undefined` to indicate that the validation
   * could not be performed.
   *
   * Sends the userId and password to the backend, which performs
   * the secure comparison on the server side.
   *
   * @param password - The password to validate.
   * @returns A boolean indicating whether the password matches,
   *          or `undefined` if no user is currently loaded.
   */
  async isCurrentUserPassword(password: string): Promise<boolean | undefined> {
    if (!this.user()) return undefined;
    const result = await this.#httpHandler.request<{ isEqual: boolean }>(
      'post',
      'users/check-password',
      { userId: this.user()!.userId, password },
      { maxRetries: 3, initialDelay: 100 }
    );

    return result?.isEqual;
  }
}
