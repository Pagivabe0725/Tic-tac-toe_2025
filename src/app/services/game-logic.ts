import {
  computed,
  effect,
  Injectable,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';

const baseURL = 'http://localhost:3000/tic';

@Injectable({
  providedIn: 'root',
})
export class GameLogic {
  #field?: string[][] = [];
  #markup?: string;

  /** Reactive signal storing the size of the game board */
  #size: WritableSignal<number> = signal(3);

  /**
   * Computed signal that generates an empty game field based on the `size` signal.
   * Each cell is represented by an empty string `''`.
   */
  #cells: Signal<string[][]> = computed(() => {
    return Array(this.#size())
      .fill(null)
      .map(() => Array(this.#size()).fill(''));
  });

  /**
   * Writable signal representing the actual game board state.
   * Initially undefined until the computed `cells` are initialized.
   */
  protected gameField: WritableSignal<string[][] | undefined> =
    signal(undefined);

  get field(): string[][] | undefined {
    return this.#field;
  }

  set field(newField: string[][] | undefined) {
    this.#field = newField;
  }

  get markup(): string | undefined {
    return this.#markup;
  }

  set markup(newMarkup: string | undefined) {
    this.#markup = newMarkup;
  }
  
  get size(): Signal<number> {
    return this.#size;
  }

  set size(newSize: number) {
    this.#size.set(newSize);
  }

  /** Getter for computed empty cells */
  get cells(): Signal<string[][]> {
    return this.#cells;
  }

  constructor() {
    // Keep the gameField signal in sync with the computed cells.
    effect(() => {
      if (this.#cells()) {
        this.gameField?.set(this.#cells());
      }
    });
  }

  async fetchRequest(
    url: string,
    method: string,
    body: any
  ): Promise<any | undefined> {
    const request = await fetch(url, {
      method: method,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await request.ok;
    if (result) {
      return await request.json();
    }

    return undefined;
  }

  async getEnemyNextStep() {
    const body = {
      field: this.field,
      markup: this.markup,
    };
    const result = await this.fetchRequest(
      baseURL + '/next-step',
      'POST',
      body
    );

    return result;
  }
}
