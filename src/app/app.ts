import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { FormsModule } from '@angular/forms';
import { Dialog } from './components/dialog/dialog';
import { DialogHandler } from './services/dialog-handler.service';
import { Auth } from './services/auth.service';
import { SnackBar } from './components/snack-bar/snack-bar';
import { Store } from '@ngrx/store';
import {
  selectGameInfo,
  selectGameWinner,
} from './store/selectors/game-info.selector';
import { modifyGameInfo } from './store/actions/game-info-modify.action';
import { storageCleaner } from './utils/functions/storage-cleaner.function';
import { SnackBarHandler } from './services/snack-bar-handler.service';

/**
 * @component App
 * @description
 * Root component of the application.
 *
 * Responsibilities:
 * - Initializes the current user session on app load.
 * - Provides method to start a new game by resetting game state.
 * - Handles global services injection: Auth, Store, DialogHandler.
 * - Tracks the current winner via a reactive signal.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, FormsModule, Dialog, SnackBar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  /** Dialog service to open and manage dialogs app-wide */
  protected dialog: DialogHandler = inject(DialogHandler);

  /** Auth service to manage user authentication */
  #auth: Auth = inject(Auth);

  /** NgRx Store to manage global app state */
  #store: Store = inject(Store);

  /**placeholder  ----------------*/
  protected snackBarHandler: SnackBarHandler = inject(SnackBarHandler)

  /** Reactive signal representing the current winner */
  protected winner = this.#store.selectSignal(selectGameWinner);

  /** Lifecycle hook: sets the current user if a session exists */
  ngOnInit(): void {
    this.#auth.setCurrentUserIfExist();
  }

  /**
   * Resets the game to its initial state:
   * - Clears the board and step counters
   * - Resets the active markup to 'o'
   * - Resets timers and last move
   * - Cleans the sessionStorage for all game-related entries
   */
  startNewGame() {
    this.#store.dispatch(
      modifyGameInfo({
        actualBoard: undefined,
        actualStep: 0,
        actualMarkup: 'o',
        lastMove: undefined,
        started: false,
        playerSpentTime: { player_O: 0, player_X: 0 },
        winner: null,
      })
    );

    const { results, ...actualGameInfo } =
      this.#store.selectSignal(selectGameInfo)();
    if (actualGameInfo) {
      storageCleaner('sessionStorage', true, ...Object.keys(actualGameInfo));
    }
  }
}
