import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from '../../utils/interfaces/game-state.interface';

export const selectGameState =
  createFeatureSelector<GameState>('gameState');

export const selectGameSize = createSelector(
  selectGameState,
  (state) => state.size
);

export const selectGameOpponent = createSelector(
  selectGameState,
  (state) => state.opponent
);

export const selectGameHardness = createSelector(
  selectGameState,
  (state) => state.hardness
);
