import { Injectable } from '@angular/core';

const baseURL = 'http://localhost:3000/tic';

@Injectable({
  providedIn: 'root',
})
export class GameLogic {
  #field?: string[][] = [];
  #markup?: string;

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
