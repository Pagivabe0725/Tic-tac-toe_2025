import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { firstValueFrom, Subject, take } from 'rxjs';

export const DialogContents = [
  'game_setting',
  'save',
  'setting',
  'login',
  'registration',
  'info',
] as const;

export type dialogContent = (typeof DialogContents)[number];

@Injectable({
  providedIn: 'root',
})
export class DialogHandler {
  #activeContent: WritableSignal<dialogContent | undefined> = signal(undefined);

  /**
   * placeholder
   */
  #dataSubject: Subject<any> | null = null;

  /**
   * placeholder
   */
  get activeContent(): Signal<dialogContent | undefined> {
    return this.#activeContent.asReadonly();
  }

  /**
   * placeholder
   */
  set activeContent(content: dialogContent | undefined) {
    this.#activeContent.set(content);
  }

  /**
   * placeholder
   */
  public async openDialog(content: dialogContent) {
    this.#activeContent.set(content);
    this.#dataSubject = new Subject<any>();

    const result = await firstValueFrom(
      this.#dataSubject.asObservable().pipe(take(1))
    );

    this.close();
    return result;
  }

  /**
   * placeholder
   */
  close = () => {
    this.#dataSubject?.next(undefined);
    this.#dataSubject?.complete();
    this.#dataSubject = null;
    this.#activeContent.set(undefined);
  };

  /**
   * placeholder
   */
  dailogEmitter(value: any) {
    this.#dataSubject?.next(value);
  }
}
