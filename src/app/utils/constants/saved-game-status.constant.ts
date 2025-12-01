/**
 * List of all possible statuses a saved game can have.
 * Matches the backend enum values exactly.
 *
 * Values:
 * - 'not_started' → Game has been created but no moves have been made yet.
 * - 'in_progress' → Game is currently being played.
 * - 'won' → The player has won the game.
 * - 'lost' → The player has lost the game.
 * - 'draw' → The game ended without a winner.
 */
export const SAVED_GAME_STATUSES = [
  'not_started',
  'in_progress',
  'won',
  'lost',
  'draw',
] as const;
