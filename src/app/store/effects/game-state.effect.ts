import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { modifyGameState } from '../actions/game-modify.action';
import { tap } from 'rxjs';
import { STORAGE_PREFIX } from '../../utils/constants/sessionstorage-prefix.constant';

export class GameStateStorageEffects {
  private actions$: Actions = inject(Actions);
  saveState = createEffect(
    () =>
      this.actions$.pipe(
        ofType(modifyGameState),
        tap((action) => {
          const { type, ...states } = action;
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

  constructor() {}
}
