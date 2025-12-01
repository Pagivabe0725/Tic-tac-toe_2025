import {
  Component,
  inject,
  Input,
  output,
  OutputEmitterRef,
} from '@angular/core';
import { GameElement } from './game-element/game-element';
import { SavedGame } from '../../../utils/interfaces/saved-game.interface';
import { DialogHandler } from '../../../services/dialog-handler.service';

@Component({
  selector: 'section[appLoader]',
  imports: [GameElement],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
})
export class Loader {
  /** Service for opening confirmation dialogs. */
  #dialogHandler: DialogHandler = inject(DialogHandler);

  /**
   * Event emitted when the user confirms deletion of a game.
   * Emits the ID of the game to be deleted.
   */
  deleteEvent: OutputEmitterRef<string> = output();

  /**
   * Event emitted when the user confirms loading a game.
   * Emits the ID of the game to be loaded.
   */
  loadeEvent: OutputEmitterRef<string> = output();

  /**
   * List of saved games to be displayed.
   * Provided by the parent component.
   */
  @Input({ required: true }) savedGames?: SavedGame[];

  /**
   * Shows a confirmation dialog and emits a delete event if confirmed.
   *
   * @param id - The ID of the game to delete.
   */
  async delete(id: string): Promise<void> {
    const result = await this.#dialogHandler.openCustomDialog(
      'message',
      'Delete game',
      'Do you want to delete this game?',
      true
    );
    if (result) this.deleteEvent.emit(id);
  }

  /**
   * Shows a confirmation dialog and emits a load event if confirmed.
   *
   * @param id - The ID of the game to load.
   */
  async loadGame(id: string): Promise<void> {
    console.log(id);
    const result = await this.#dialogHandler.openCustomDialog(
      'message',
      'Loading game',
      'Do you want to load this game?',
      true
    );
    if (result) this.loadeEvent.emit(id);
  }
}
