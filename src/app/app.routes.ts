import { Routes } from '@angular/router';
import { Game } from './components/game/game';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tic-tac-toe',
    pathMatch:'full'
  },
  {
    path: 'tic-tac-toe',
    component: Game,
    title: 'game',
  },
];
