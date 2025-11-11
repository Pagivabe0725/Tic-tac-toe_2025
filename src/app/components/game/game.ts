import {
  Component,
  computed,
  effect,
  inject,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { GameField } from './game-field/game-field';
import { GameDisplayPart } from './game-display-part/game-display-part';
import { GameFieldCell } from './game-field-cell/game-field-cell';
import { GameLogic } from '../../services/game-logic.service';
import { CellCoordinate } from '../../utils/interfaces/celll-coordinate.interface';
import { game } from '../../utils/interfaces/game.interface';
import { Store } from '@ngrx/store';
import { selectGameHardness, selectGameOpponent, selectGameSize } from '../../store/selectors/game-state.selector';



/**
 * @component Game
 *
 * Represents the main controller for the game board.
 * This component manages the current game state, handles player and AI moves,
 * and connects the UI with the {@link GameLogic} service.
 *
 * It uses Angular signals to track reactive state such as the board,
 * the active player, and the game step count.
 */

@Component({
  selector: 'app-game',
  imports: [GameField, GameDisplayPart, GameFieldCell],
  templateUrl: './game.html',
  styleUrl: './game.scss',
})
export class Game {

  store:Store = inject(Store)

  #step: WritableSignal<number> = signal(0);
  #hardness: Signal<number> = this.store.selectSignal(selectGameHardness);
  #opponent: Signal<'player' | 'computer'> =this.store.selectSignal(selectGameOpponent)
  #lastMove: WritableSignal<game['lastMove']> = signal(undefined);
  #actualMarkup: Signal<'x' | 'o'> = computed(() => {
    return this.#step() % 2 === 0 ? 'o' : 'x';
  });

  #clickPermission: Signal<boolean> = computed(() => {
    if (this.#opponent() === 'player') return true;
    else {
      return this.#step() % 2 === 0 ? true : false;
    }
  });

  #size: Signal<number> = this.store.selectSignal(selectGameSize);

  #cellStructure: Signal<string[][]> = computed(() => {
    const size = this.#size();
    return Array.from({ length: size }, () =>
      Array.from({ length: size }, () => '')
    );
  });

  #gameField: WritableSignal<string[][] | undefined> = signal(undefined);

  get step(): Signal<number> {
    return this.#step.asReadonly();
  }

  get hardness(): Signal<number> {
    return this.#hardness;
  }

  get opponent(): Signal<'player' | 'computer'> {
    return this.#opponent;
  }

  get lastMove(): Signal<game['lastMove']> {
    return this.#lastMove.asReadonly();
  }

  get actualMarkup(): Signal<'x' | 'o'> {
    return this.#actualMarkup;
  }

  get clickPermission(): Signal<boolean> {
    return this.#clickPermission;
  }

  get size(): Signal<number> {
    return this.#size
  }

  get cellStructure(): Signal<string[][]> {
    return this.#cellStructure;
  }

  get gameField(): Signal<string[][] | undefined> {
    return this.#gameField.asReadonly();
  }

  constructor() {
    effect(() => {
      const cellStructure = this.#cellStructure().map((row) => [...row]);
      this.#gameField.set(cellStructure);
    });

   /*  const game$:Observable<object> = this.store.select<gameStateReducer>('gameState')
    game$.subscribe(
      (value:any)=>{
        this.#size.set(value['size'])
        this.#hardness.set(value['hardness'])
        this.#opponent.set(value['opponent'])
      }
    ) */

    
  }

  setCell(coordinates: CellCoordinate) {
    this.#gameField.update((prev) => {
      if (!prev) return prev;
      const newField = prev.map((row) => [...row]);
      newField[coordinates.xCoordinate][coordinates.yCoordinate] =
        this.actualMarkup();
      return newField;
    });
    this.#step.update((previous) => {
      return ++previous;
    });
  }
}
