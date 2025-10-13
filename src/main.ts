import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Theme } from './app/services/theme';
import { inject } from '@angular/core';

bootstrapApplication(App, appConfig)
  .then((app) => {
    const theme = app.injector.get(Theme);
  })
  .catch((err) => console.error(err));
