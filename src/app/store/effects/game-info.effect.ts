import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { modifyGameInfo } from '../actions/game-info-modify.action';
import { tap } from 'rxjs';
import { STORAGE_PREFIX } from '../../utils/constants/sessionstorage-prefix.constant';

/**
 * @class gameInfoStorageEffect
 * Effect responsible for persisting the GameInfo state to sessionStorage.
 * Listens for `modifyGameInfo` actions and saves the updated properties.
 */
export class gameInfoStorageEffect {
  
  /**
   * Injected Actions stream from NgRx.
   * Used to listen for dispatched actions.
   */
  private actions$: Actions = inject(Actions);

  /**
   * Effect that listens for `modifyGameInfo` actions.
   * For each action, iterates through the updated properties and
   * saves them to sessionStorage using a prefixed key.
   * 
   * @note {dispatch: false} because this effect does not dispatch any new action.
   */
  saveState = createEffect(
    () =>
      this.actions$.pipe(
        ofType(modifyGameInfo),
        tap((action) => {
          // Extract properties from the action, ignoring the `type`
          const { type, ...states } = action;

          // Iterate through all state properties and save them to sessionStorage
          for (const [key, value] of Object.entries(states)) {
            if (value !== undefined && value !== null) {
              sessionStorage.setItem(
                `${STORAGE_PREFIX}${key}`,
                JSON.stringify(value)
              );
            }
          }
        })
      ),
    { dispatch: false }
  );
}
