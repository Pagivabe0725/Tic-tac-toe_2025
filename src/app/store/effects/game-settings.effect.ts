import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { modifyGameSettings } from '../actions/game-settings-modify.action';
import { tap } from 'rxjs';
import { STORAGE_PREFIX } from '../../utils/constants/sessionstorage-prefix.constant';

/**
 * @class GameSettingsStorageEffects
 * Effect responsible for persisting the GameSettings state to sessionStorage.
 * Listens for `modifyGameSettings` actions and saves the updated properties.
 */
export class GameSettingsStorageEffects {

  /**
   * Injected Actions stream from NgRx.
   * Used to listen for dispatched actions.
   */
  private actions$: Actions = inject(Actions);

  /**
   * Effect that listens for `modifyGameSettings` actions.
   * Iterates through the updated properties of the action and
   * saves each non-null/non-undefined value to sessionStorage
   * using a prefixed key.
   * 
   * @note {dispatch: false} because this effect does not dispatch any new action.
   */
  saveState = createEffect(
    () =>
      this.actions$.pipe(
        ofType(modifyGameSettings),
        tap((action) => {
          // Extract properties from the action, ignoring the `type`
          const { type, ...states } = action;

          // Save each defined property to sessionStorage
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
