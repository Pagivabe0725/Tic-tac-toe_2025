import { Routes } from '@angular/router';
import { Game } from './components/game/game';
import { NotFound } from './components/not-found/not-found';
import { accountGuard } from './guards/account-guard';

export const ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'tic-tac-toe',
    pathMatch: 'full',
  },
  {
    path: 'tic-tac-toe',
    component: Game,
    title: 'game',
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./components/account/account').then(
        (component) => component.Account
      ),
    title: 'My account',
    canActivate: [accountGuard],
  },

  {
    path: '**',
    component: NotFound,
    title: 'page not found',
  },
];
