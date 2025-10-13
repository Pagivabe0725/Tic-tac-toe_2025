import {
  Component,
  computed,
  effect,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { GameField } from './game-field/game-field';
import { GameDisplayPart } from './game-display-part/game-display-part';
import { GameFieldCell } from './game-field-cell/game-field-cell';

@Component({
  selector: 'app-game',
  imports: [GameField, GameDisplayPart, GameFieldCell],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game {
  protected size: WritableSignal<number> = signal(9)
  protected cells: Signal<string[][]> = computed(() => {
    return Array(this.size())
      .fill(null)
      .map(() => Array(this.size()).fill(''));
  });
  protected step: WritableSignal<number> = signal(0);
  protected actualMarkup: Signal<'o' | 'x'> = computed(() => {
    return this.step() % 2 === 0 ? 'o' : 'x';
  });
  protected gameField: WritableSignal<string[][] | undefined> =
    signal(undefined);

  constructor() {
    effect(() => {
      if (this.cells()) {
        this.gameField?.set(this.cells());
      }
    });
  }

  setCell(coordinates: { xCoordinate: number; yCoordinate: number }): void {
    const copiedFields: string[][] = [...this.gameField()!];
    copiedFields[coordinates.yCoordinate][coordinates.xCoordinate] =
      this.actualMarkup();
    this.gameField.set(copiedFields);
    this.step.update((previous) => previous + 1);

    console.log(this.gameField());
  }
}
