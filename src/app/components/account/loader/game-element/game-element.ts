import {
  Component,
  computed,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';

import { SavedGame } from '../../../../utils/interfaces/saved-game.interface';

@Component({
  selector: 'app-game-element',
  imports: [],
  templateUrl: './game-element.html',
  styleUrl: './game-element.scss',
})
export class GameElement {
  /**
   * Contains the full data of a single saved game.
   * Provided by the parent loader component.
   */
  gameDatas: InputSignal<SavedGame> = input.required();

  /**
   * Event emitted when the user requests deletion of this game.
   * Emits the ID of the game.
   */
  deleteEvent: OutputEmitterRef<string> = output();

  /**
   * Event emitted when the user requests loading of this game.
   * Emits the ID of the game.
   */
  loadeEvent: OutputEmitterRef<string> = output();

  /**
   * A formatted date string computed from the game's last update timestamp.
   * Automatically recalculates whenever the game data changes.
   */
  protected date: Signal<string> = computed(() => {
    return new Date(Number(this.gameDatas().updatedAt)).toLocaleString();
  });
}
