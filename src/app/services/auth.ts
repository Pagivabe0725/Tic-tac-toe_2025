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
import { Functions } from './functions';

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

  first = true;

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
      if (!this.csrf() && this.first) {
        this.setCSRF();
        this.first = false;
      }

      if (this.csrf() !== undefined) {
        /*    this.login('teszt@gmail.com', '123456').then((result) => {
          console.log(result);
        }); */

        /* this.isUserAlreadyLoggedIn().then((r) => {
          console.log(r);
        }); */

       this.signup('teszt3@gmail.com', 'valami', 'valami')
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

  async isUserAlreadyLoggedIn(): Promise<any | undefined> {
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
      return this.#helper_functions.pick(response.user, [
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
        .post(
          `${baseURL}/users/logout`,
          { alma: 1 },
          {
            withCredentials: true,
            headers: {
              'X-CSRF-Token': this.csrf()!,
            },
          }
        )
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
          .post<{userId:string}>(
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

      return response.userId
    } catch (_) {
      return undefined
    }
  }
}
