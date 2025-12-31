import {
  DestroyRef,
  inject,
  Injectable,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Params,
  QueryParamsHandling,
  Router,
} from '@angular/router';
import { filter, map, switchMap, tap } from 'rxjs';

/**
 * @service RouterService
 *
 * Centralized service to manage Angular Router navigation and reactive tracking
 * of the current endpoint and query parameters.
 */
@Injectable({
  providedIn: 'root',
})
export class RouterService {
  /** Angular Router instance. */
  #router: Router = inject(Router);

  /** Angular DestroyRef to cleanup subscriptions. */
  #destroy: DestroyRef = inject(DestroyRef);

  /** Signal storing the current route path (without query params). */
  #currentEndpoint: WritableSignal<string | undefined> = signal(undefined);

  /** Signal storing current route query parameters. */
  #queryParams: WritableSignal<Params> = signal({});

  /** Read-only signal for current endpoint path. */
  get currentEndpoint(): Signal<string | undefined> {
    return this.#currentEndpoint;
  }

  /** Read-only signal for current query parameters. */
  get queryParams(): Signal<Params> {
    return this.#queryParams;
  }

  constructor() {
    /** Subscribes to router events to update endpoint and query params signals. */
    const routerSubscription = this.#router.events
      .pipe(
        /** Only act on NavigationEnd events. */
        filter((event) => event instanceof NavigationEnd),

        /** Update the current endpoint signal on navigation. */
        tap((event) => {
          const URL = event.urlAfterRedirects.split('?')[0];
          this.#currentEndpoint.set(URL.slice(1));
        }),

        /** Find the innermost ActivatedRoute. */
        map(() => {
          let route: ActivatedRoute = this.#router.routerState.root;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),

        /** Switch to the queryParams observable of the innermost route. */
        switchMap((route) => route.queryParams)
      )
      /** Update the queryParams signal whenever query params change. */
      .subscribe((params) => {
        this.#queryParams.set(params);
      });

    /** Unsubscribe from router events when the service is destroyed. */
    this.#destroy.onDestroy(() => {
      routerSubscription.unsubscribe();
    });
  }

  /**
   * Navigate to a specific path with optional query parameters and handling.
   * @param path Route path to navigate to.
   * @param queryParams Optional query parameters.
   * @param queryParamsHandling Optional queryParamsHandling mode.
   */
  navigateTo(
    path: string[],
    queryParams?: Params,
    queryParamsHandling?: QueryParamsHandling
  ): void {
    this.#router.navigate(path, {
      ...(queryParams ? { queryParams:{...queryParams} } : {}),
      ...(queryParamsHandling ? { queryParamsHandling } : {}),
    });
  }
}
