import { bootstrapApplication } from '@angular/platform-browser';
import { APPCONFIG } from './app/app.config';
import { App } from './app/app';
import { Theme } from './app/services/theme';

/**
 * The main entry point of the Angular application.
 *
 * This file is responsible for bootstrapping the root component (`App`)
 * using the provided application configuration (`appConfig`).
 *
 * During bootstrap, Angular creates the root dependency injection context (injector),
 * sets up global providers, and prepares the change detection mechanism
 * as specified in `appConfig`.
 *
 * The `Theme` service is retrieved right after bootstrapping to ensure that
 * global theme settings (e.g. dark/light mode) are available immediately.
 */
bootstrapApplication(App, APPCONFIG)
  /** Retrieve the Theme service instance from the root injector. */
  .then((app) => {
   app.injector.get(Theme);
  })
  .catch((err) => {
    /** Logs any bootstrap errors to the console for debugging purposes. */
    console.error(err);
  });
