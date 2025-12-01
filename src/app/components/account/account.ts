import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { modifyGameInfo } from '../../store/actions/game-info-modify.action';
import { Auth } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountHeader } from './account-header/account-header';
import { Loader } from './loader/loader';

import { SavedGame } from '../../utils/interfaces/saved-game.interface';
import { Http } from '../../services/http.service';
import { modifyGameSettings } from '../../store/actions/game-settings-modify.action';
import { Subscription } from 'rxjs';
import { User } from '../../utils/interfaces/user.interface';
import { Functions } from '../../services/functions.service';
import { savedGameStatus } from '../../utils/types/game-status.type';
import { Operations } from './operations/operations';
import { order } from '../../utils/types/order.type';

@Component({
  selector: 'app-account',
  imports: [AccountHeader, Loader, Operations],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit, OnDestroy {
  #store: Store = inject(Store);
  #auth: Auth = inject(Auth);
  #http: Http = inject(Http);
  #router: Router = inject(Router);
  #activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  #helperFunctions: Functions = inject(Functions);
  #paramSub?: Subscription;

  /** Signal holding the current logged-in user */
  protected user!: Signal<User>;

  /** Signal holding the saved games for the current page */
  protected savedGames: WritableSignal<SavedGame[] | undefined> = signal(undefined);

  /** Current page number in pagination */
  protected page: WritableSignal<number> = signal(1);

  /** Total number of pages based on fetched games */
  protected pageCount: WritableSignal<number> = signal(1);

  /** Optional filter for game status */
  protected filter: WritableSignal<savedGameStatus | null> = signal(null);

  /** Sorting order (e.g., time-desc, name-asc) */
  protected order: WritableSignal<order> = signal('time-desc');

  constructor() {
    /** Redirects to main page if no user is logged in */
    effect(() => {
      if (!this.#auth.user()) this.#router.navigateByUrl('/tic-tac-toe');
    });
  }

  /** Initializes the component, sets user signal and subscribes to query params */
  async ngOnInit(): Promise<void> {
    this.#store.dispatch(modifyGameInfo({ winner: undefined }));
    this.user = this.#auth.user as Signal<User>;
    this.initializeParamSub();
  }

  /** Cleanup on component destroy */
  ngOnDestroy(): void {
    this.#paramSub?.unsubscribe();
  }

  /**
   * Subscribes to query parameters (page, filter, order) and reloads saved games
   */
  initializeParamSub(): void {
    this.#paramSub?.unsubscribe();
    this.#paramSub = this.#activatedRoute.queryParams.subscribe(params => {
      this.page.set(Number(params['page']) || 1);
      this.filter.set(params['filter'] ?? null);
      this.order.set(params['order'] ?? 'time-desc');
      this.loadSavedGames();
    });
  }

  /**
   * Creates the GraphQL query body for fetching saved games
   * @param userId - The current user's ID
   * @param page - Current page number
   * @param order - Sorting order
   * @param status - Optional game status filter
   * @returns The GraphQL query object
   */
  private createGamesQueryBody(
    userId: string,
    page: number,
    order: order,
    status: savedGameStatus | null
  ) {
    return {
      query: `
        query games($userId: ID!, $page: Int!, $order: Order, $orderField: OrderField!, $status: GameStatus) {
          games(userId: $userId, page: $page, order: $order, orderField: $orderField, status: $status) {
            count
            games {
              gameId
              name
              lastMove { row column }
              status
              userId
              createdAt
              updatedAt
              board
              difficulty
              size
              opponent
            }
          }
        }
      `,
      variables: {
        userId,
        page,
        order: order.includes('asc') ? 'asc' : 'desc',
        orderField: order.includes('time') ? 'updatedAt' : 'name',
        status,
      },
    };
  }

  /**
   * Loads saved games for the current user based on page, filter, and order
   */
  private async loadSavedGames() {
    const body = this.createGamesQueryBody(
      this.#auth.user()!.userId,
      this.page(),
      this.order(),
      this.filter()
    );

    const result = await this.#http.request<SavedGame[]>(
      'post',
      'graphql/game',
      body,
      { maxRetries: 3, initialDelay: 100 }
    );

    const gamesData = (result as any)?.data?.games;
    if (!gamesData) {
      this.pageCount.set(0);
      return this.savedGames.set(undefined);
    }

    this.savedGames.set(gamesData.games);
    this.pageCount.set(Math.ceil(gamesData.count / 10));
  }

  /**
   * Calculates the number of moves already made on a game board
   * @param board - 2D array representing the game board
   * @returns Number of non-empty cells (moves)
   */
  private calculateActualStep(board: string[][]) {
    return board.reduce(
      (acc, row) => acc + row.reduce((rowAcc, cell) => rowAcc + (cell !== '' ? 1 : 0), 0),
      0
    );
  }

  /**
   * Deletes a saved game by ID
   * @param id - The ID of the game to delete
   */
  protected async deleteGame(id: string) {
    const body = {
      query: `
        mutation deleteGame($gameId: ID!, $userId: ID!) {
          deleteGame(gameId: $gameId, userId: $userId) { gameId }
        }
      `,
      variables: {
        gameId: id,
        userId: this.#auth.user()!.userId,
      },
    };

    const result = await this.#http.request<{ deleteGame: { gameId: string } }>(
      'post',
      'graphql/game',
      body,
      { maxRetries: 3, initialDelay: 100 }
    );

    if ((result as any)?.data?.deleteGame?.gameId) {
      this.savedGames.set(this.savedGames()?.filter(g => g.gameId !== id));
    }
  }

  /**
   * Loads a saved game into the current game state
   * @param id - The ID of the game to load
   */
  protected loadGame(id: string) {
    const chosenGame = this.savedGames()?.find(game => game.gameId === id);
    if (!chosenGame) return;

    this.#store.dispatch(modifyGameSettings({
      size: chosenGame.size,
      opponent: chosenGame.opponent,
      hardness: this.#helperFunctions.difficultyToNumber(chosenGame.difficulty),
    }));

    const actualStep = this.calculateActualStep(chosenGame.board);
    this.#store.dispatch(modifyGameInfo({
      actualBoard: chosenGame.board,
      actualStep,
      actualMarkup: actualStep % 2 === 0 ? 'o' : 'x',
      lastMove: chosenGame.lastMove,
    }));

    this.#router.navigateByUrl('/tic-tac-toe');
  }
}
