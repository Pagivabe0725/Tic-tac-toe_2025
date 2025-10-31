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

export const baseURL = 'http://localhost:3000';

export interface User {
  userId: number;
  email: string;
  winNumber: number;
  loseNumber: number;
}
@Injectable({
  providedIn: 'root',
})
export class Auth {
  #helper_functions: Functions = inject(Functions);
  #http: HttpClient = inject(HttpClient);
  #user: WritableSignal<User | undefined> = signal(undefined);
  #CSRF: WritableSignal<string | undefined> = signal(undefined);

  private isFirstCSRFLoad = true;
  private isFirstLoginCheck = true;

  get user(): Signal<User | undefined> {
    return this.#user.asReadonly();
  }

  set user(newValue: User | undefined) {
    this.#user.set(newValue);
  }

  get csrf(): Signal<string | undefined> {
    return this.#CSRF.asReadonly();
  }

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

  async getCSRF(): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.#http
          .get<{ csrfToken: string }>(`${baseURL}/csrf-token`, {
            withCredentials: true,
          })
          .pipe(take(1))
      );
      return response.csrfToken;
    } catch (_) {
      return undefined;
    }
  }

  async setCSRF() {
    const csrf = await this.getCSRF();
    console.log(csrf);
    this.#CSRF.set(csrf);
  }

  async login(email: string, password: string): Promise<User | undefined> {
    try {
      const response = await firstValueFrom(
        this.#http
          .post<{ user: object }>(
            `${baseURL}/users/login`,
            { email, password },
            {
              withCredentials: true,
              headers: {
                'X-CSRF-Token': this.csrf()!,
              },
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

  async fetchCurrentSessionUser(): Promise<User | undefined> {
    try {
      const response = await firstValueFrom(
        this.#http
          .post<{ user: User }>(`${baseURL}/users/check-session`, undefined, {
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

  async logout(): Promise<void> {
    console.log('logout csrf:', this.csrf());
    await firstValueFrom(
      this.#http
        .post(`${baseURL}/users/logout`, undefined, {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': this.csrf()!,
          },
        })
        .pipe(take(1))
    );
    this.#CSRF.set(undefined);
    this.user = undefined;
  }

  async signup(
    email: string,
    password: string,
    rePassword: string
  ): Promise<string | undefined> {
    try {
      const response = await firstValueFrom(
        this.#http
          .post<{ userId: string }>(
            `${baseURL}/users/signup`,
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

      return response.userId;
    } catch (_) {
      return undefined;
    }
  }

  async setCurrentUserIfExist(): Promise<void> {
    if (this.csrf()) {
      this.user = await this.fetchCurrentSessionUser();
      console.log(this.user());
    }
  }

  async isUsedEmail(email: string): Promise<boolean> {
    if (this.csrf()) {
      try {
        const respones = await firstValueFrom(
          this.#http
            .post<{ result: boolean }>(
              `${baseURL}/users/is-used-email`,
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
