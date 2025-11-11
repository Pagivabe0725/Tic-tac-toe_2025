import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { ROUTES } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { csrfInterceptor } from './shared/interceptors/csfr.interceptor';
import { provideStore } from '@ngrx/store';
import { gameStateReducer } from './store/reducers/game-state.reducer';
import { provideEffects } from '@ngrx/effects';
import { GameStateStorageEffects } from './store/effects/game-state.effect';

export const APPCONFIG: ApplicationConfig = {
  providers: [

    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(ROUTES),
    provideHttpClient(withInterceptors([csrfInterceptor])),
    provideStore({
      gameState: gameStateReducer,
    }),
    provideEffects([GameStateStorageEffects]),
  ],
};
