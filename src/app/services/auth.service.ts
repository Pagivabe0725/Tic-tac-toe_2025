import { HttpClient } from '@angular/common/http';
import {
  effect,
  inject,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { Functions } from './functions.service';
import { BASE_URL } from '../utils/constants/base-URL.constant';

/**
 * Represents the structure of a user entity received from the backend.
 */
export interface User {
  userId: number;
  email: string;
  winNumber: number;
  loseNumber: number;
}

/**
 * Service handling authentication-related logic,
 * including login, logout, signup, session validation,
 * and CSRF token management.
 */
@Injectable({
  providedIn: 'root',
})
export class Auth {
  /**
   * Injected helper service providing utility functions.
   */
  #helper_functions: Functions = inject(Functions);

  /**
   * Injected Angular HttpClient used for API communication.
   */
  #http: HttpClient = inject(HttpClient);

  /**
   * Writable signal representing the currently logged-in user.
   */
  #user: WritableSignal<User | undefined> = signal(undefined);

  /**
   * Writable signal storing the current CSRF token.
   */
  #CSRF: WritableSignal<string | undefined> = signal(undefined);

  /**
   * Flag to ensure CSRF token is loaded only once on service initialization.
   */
  private isFirstCSRFLoad = true;

  /**
   * Flag to ensure user session check runs only once after CSRF token is obtained.
   */
  private isFirstLoginCheck = true;

  /**
   * Readonly signal providing access to the current user value.
   */
  get user(): Signal<User | undefined> {
    return this.#user.asReadonly();
  }

  /**
   * Setter for updating the current user signal value.
   * @param newValue - New user object or undefined to clear the user.
   */
  set user(newValue: User | undefined) {
    this.#user.set(newValue);
  }

  /**
   * Readonly signal providing access to the current CSRF token.
   */
  get csrf(): Signal<string | undefined> {
    return this.#CSRF.asReadonly();
  }

  /**
   * Initializes the authentication service.
   * Automatically retrieves the CSRF token and checks for existing user sessions.
   */
  constructor() {
    effect(() => {
      if (!this.csrf() && this.isFirstCSRFLoad) {
        this.setCSRF();
        this.isFirstCSRFLoad = false;
      }
    });

    effect(() => {
      if (this.csrf() && !this.user() && this.isFirstLoginCheck) {
        this.setCurrentUserIfExist();
        this.isFirstLoginCheck = false;
      }
    });
  }

  /**
   * Fetches a new CSRF token from the backend API.
   * @returns A Promise resolving to the CSRF token string or undefined if the request fails.
   */
  async getCSRF(): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.#http
          .get<{ csrfToken: string }>(`${BASE_URL}/csrf-token`, {
            withCredentials: true,
          })
          .pipe(take(1))
      );
      return response.csrfToken;
    } catch (_) {
      return undefined;
    }
  }

  /**
   * Retrieves and stores a new CSRF token internally in the service state.
   */
  async setCSRF() {
    const csrf = await this.getCSRF();
    console.log(csrf);
    this.#CSRF.set(csrf);
  }

  /**
   * Logs in a user using their email and password credentials.
   * @param email - The user’s email address.
   * @param password - The user’s password.
   * @returns A Promise resolving to the authenticated User object or undefined if login fails.
   */
  async login(email: string, password: string): Promise<User | undefined> {
    try {
      const response = await firstValueFrom(
        this.#http
          .post<{ user: object }>(
            `${BASE_URL}/users/login`,
            { email, password },
            {
              withCredentials: true,
             /*  headers: {
                'X-CSRF-Token': this.csrf()!,
              }, */
            }
          )
          .pipe(take(1))
      );
      return this.#helper_functions.pick<User>(response.user, [
        'userId',
        'email',
        'winNumber',
        'loseNumber',
      ]);
    } catch (_) {
      return undefined;
    }
  }

  /**
   * Fetches the currently authenticated user from an existing session (if any).
   * @returns A Promise resolving to the User object or undefined if no session exists.
   */
  async fetchCurrentSessionUser(): Promise<User | undefined> {
    try {
      const response = await firstValueFrom(
        this.#http
          .post<{ user: User }>(`${BASE_URL}/users/check-session`, undefined, {
            withCredentials: true,
            headers: {
              'X-CSRF-Token': this.csrf()!,
            },
          })
          .pipe(take(1))
      );
      return this.#helper_functions.pick<User>(response.user, [
        'userId',
        'email',
        'winNumber',
        'loseNumber',
      ]);
    } catch (_) {
      return undefined;
    }
  }

  /**
   * Logs out the currently authenticated user and clears stored session data.
   */
  async logout(): Promise<void> {
    await firstValueFrom(
      this.#http
        .post(`${BASE_URL}/users/logout`, undefined, {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': this.csrf()!,
          },
        })
        .pipe(take(1))
    );
    //this.#CSRF.set(undefined);
    this.user = undefined;
  }

  /**
   * Registers a new user account in the backend.
   * @param email - The user’s email address.
   * @param password - The chosen password.
   * @param rePassword - The password confirmation.
   * @returns A Promise resolving to the new user’s ID string or undefined if registration fails.
   */
  async signup(
    email: string,
    password: string,
    rePassword: string
  ): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.#http
          .post<{ userId: string }>(
            `${BASE_URL}/users/signup`,
            {
              email: email, 
              password: password,
              confirmPassword: rePassword,
            },
            {
              withCredentials: true,
              headers: {
                'X-CSRF-Token': this.csrf()!,
              },
            }
          )
          .pipe(take(1))
      );

      console.log('USER_ID:',response.userId)
      return response.userId;
    } catch (_) {
      return undefined;
    }
  }

  /**
   * Checks if an existing session is active and sets the current user accordingly.
   */
  async setCurrentUserIfExist(): Promise<void> {
    if (this.csrf()) {
      this.user = await this.fetchCurrentSessionUser();
      console.log(this.user());
    }
  }

  /**
   * Determines whether a given email address is already registered.
   * @param email - The email address to check.
   * @returns A Promise resolving to `true` if the email is already used, otherwise `false`.
   */
  async isUsedEmail(email: string): Promise<boolean> {
    if (this.csrf()) {
      try {
        const respones = await firstValueFrom(
          this.#http
            .post<{ result: boolean }>(
              `${BASE_URL}/users/is-used-email`,
              { email: email },
              {
                withCredentials: true,
                headers: {
                  'X-CSRF-Token': this.csrf()!,
                },
              }
            )
            .pipe(take(1))
        );

        return respones.result;
      } catch (_) {
        return false;
      }
    }
    return true;
  }
}
