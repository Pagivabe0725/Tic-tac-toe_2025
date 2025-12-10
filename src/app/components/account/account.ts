import {
  Component,
  effect,
  inject,
  OnInit,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { modifyGameInfo } from '../../store/actions/game-info-modify.action';
import { Auth } from '../../services/auth.service';
import { AccountHeader } from './account-header/account-header';
import { GameHandler } from './game-handler/game-handler';
import { SavedGame } from '../../utils/interfaces/saved-game.interface';
import { Http } from '../../services/http.service';
import { User } from '../../utils/interfaces/user.interface';
import { savedGameStatus } from '../../utils/types/game-status.type';
import { Operations } from './operations/operations';
import { order } from '../../utils/types/order.type';
import { RouterService } from '../../services/router.service';

@Component({
  selector: 'app-account',
  imports: [AccountHeader, GameHandler, Operations],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  /** NgRx store instance for dispatching and selecting application state */
  #store: Store = inject(Store);

  /** Auth service to get current user and authentication state */
  #auth: Auth = inject(Auth);

  /** Http service for making HTTP/GraphQL requests to the backend */
  #http: Http = inject(Http);

  /** RouterService for programmatic navigation and reactive query param tracking */
  #routerHandler: RouterService = inject(RouterService);

  /** Signal holding the current logged-in user */
  protected user!: Signal<User>;

  /** Signal holding the saved games for the current page */
  protected savedGames: WritableSignal<SavedGame[] | undefined> =
    signal(undefined);

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
      if (!this.#auth.user()) this.#routerHandler.navigateTo(['tic-tac-toe']);
    });

    /**
     * Reactive effect that monitors query parameters from the URL
     * and updates the page, filter, and order signals accordingly.
     * Also triggers a reload of saved games whenever any relevant
     * query parameter changes.
     */
    effect(() => {
      const params = this.#routerHandler.queryParams();
      if(params){
        // Update the current page based on query params
        this.page.set(Number(params['page']) || 1);

        // Update the active game status filter from query params
        this.filter.set(params['filter'] ?? null);

        // Update the ordering option from query params
        this.order.set(params['order'] ?? 'time-desc');

        // Reload games whenever page, filter, or order changes
        this.loadSavedGames();
      }
    });
  }

  /** Initializes the component, sets user signal and dispatches initial store actions */
  async ngOnInit(): Promise<void> {
    // Reset any modified game info in the store
    this.#store.dispatch(modifyGameInfo({ winner: undefined }));

    // Set the current user signal from Auth service
    this.user = this.#auth.user as Signal<User>;
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
        // Map our order signal into GraphQL compatible format
        order: order.includes('asc') ? 'asc' : 'desc',
        orderField: order.includes('time') ? 'updatedAt' : 'name',
        status,
      },
    };
  }

  /**
   * Loads saved games for the current user based on page, filter, and order.
   *
   * - Builds the GraphQL request body
   * - Sends HTTP POST request to the backend
   * - Updates `savedGames` and `pageCount` signals based on response
   * - Handles missing or empty results gracefully
   */
  protected async loadSavedGames() {
    const body = this.createGamesQueryBody(
      this.#auth.user()!.userId,
      this.page(),
      this.order(),
      this.filter()
    );

    // Send GraphQL request with retry mechanism
    const result = await this.#http.request<SavedGame[]>(
      'post',
      'graphql/game',
      body,
      { maxRetries: 3, initialDelay: 100 }
    );

    // Extract data from response
    const gamesData = (result as any)?.data?.games;

    if (!gamesData) {
      // No games returned: reset pageCount and savedGames
      this.pageCount.set(0);
      return this.savedGames.set(undefined);
    }

    // Update savedGames signal with fetched games
    this.savedGames.set(gamesData.games);

    // Calculate total pages based on count (assuming 10 games per page)
    this.pageCount.set(Math.ceil(gamesData.count / 10));
  }
}
