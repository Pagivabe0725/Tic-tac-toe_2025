import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  #logged: WritableSignal<boolean> = signal(false);

  get logged(): Signal<boolean> {
    return this.#logged;
  }

  set logged(value: boolean) {
    this.#logged.set(value);
  }
}
