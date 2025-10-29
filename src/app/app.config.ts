import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { ROUTES } from './app.routes';
import { HttpClientModule } from '@angular/common/http';

/**
 * @fileoverview
 * Defines the root Angular application configuration.
 *
 * This configuration object sets up the core Angular providers,
 * including:
 * - Global error handling
 * - Zoneless change detection (for improved performance)
 * - Routing configuration
 */

/**
 * The global Angular application configuration.
 *
 * @constant
 * @type {ApplicationConfig}
 *
 * @description
 * Registers essential providers for the app:
 * - {@link provideBrowserGlobalErrorListeners} — enables global error listeners to catch runtime exceptions.
 * - {@link provideZonelessChangeDetection} — activates zoneless change detection to reduce overhead.
 * - {@link provideRouter} — configures Angular’s router with the defined `routes`.
 */
export const APPCONFIG: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(ROUTES),
    importProvidersFrom(HttpClientModule)
  ],
};
