import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
} from '@angular/core';

import { SavedGame } from '../../../../utils/interfaces/saved-game.interface';
import { Http } from '../../../../services/http.service';

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
   * HTTP service used to communicate with the backend API.
   * Handles network requests such as GraphQL mutations.
   */
  #http: Http = inject(Http);

  /**
   * A formatted date string computed from the game's last update timestamp.
   * Automatically recalculates whenever the game data changes.
   */
  protected date: Signal<string> = computed(() => {
    return new Date(Number(this.gameDatas().updatedAt)).toLocaleString();
  });

  /**
   * Sends a request to the backend to change the name of the saved game.
   * The request is only sent if the new name differs from the old one.
   */
  protected async changeName(newValue: string): Promise<void> {
    /**
     * Stores the previously saved name for comparison.
     */
    const oldName: string = this.gameDatas().name;

    /**
     * Prevents unnecessary network calls when the name has not changed.
     */
    if (oldName !== newValue) {
      /**
       * GraphQL mutation body used to update the game name on the server.
       */
      const body = {
        query: `
        mutation UpdateGame($gameId: ID!, $name: String) {
          updateGame(gameId: $gameId, name: $name) {
            gameId
            name
          }
        }
      `,
        /**
         * Dynamic variables passed to the GraphQL mutation.
         */
        variables: {
          gameId: this.gameDatas().gameId,
          name: newValue,
        },
      };

      /**
       * Sends the HTTP request with retry and delay configuration.
       */
      const result = await this.#http.request('post', 'graphql/game', body, {
        maxRetries: 3,
        initialDelay: 200,
      });

    }
  }
}
