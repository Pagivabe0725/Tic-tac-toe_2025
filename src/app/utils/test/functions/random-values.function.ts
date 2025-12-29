import { DIALOG_CONTENT } from '../../constants/dialog-content.constant';
import { ORDERS } from '../../constants/order.constant';
import { SAVED_GAME_STATUSES } from '../../constants/saved-game-status.constant';
import { GameSettings } from '../../interfaces/game-settings.interface';
import { DialogContent } from '../../types/dialog-content.type';
import { savedGameStatus } from '../../types/game-status.type';
import { GameOrder } from '../../types/order.type';

/**
 * Returns a random integer in the range [0, length).
 *
 * @param length - Upper bound (exclusive).
 */
export function randomNumber(length: number): number {
  return Math.floor(Math.random() * length);
}

/**
 * Returns a random integer in the inclusive range [min, max].
 *
 * @param min - Minimum value (inclusive).
 * @param max - Maximum value (inclusive).
 */
export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random saved game status.
 *
 * Note:
 * - Uses a nested random index (more weight toward smaller indices).
 * - Result can include any value from `SAVED_GAME_STATUSES`.
 */
export function generateRandomStatus(): savedGameStatus {
  return SAVED_GAME_STATUSES[
    randomNumber(randomNumber(SAVED_GAME_STATUSES.length))
  ];
}

/**
 * Returns a random saved game status excluding the first entry.
 *
 * Intended for "started" states where the first status in the list is not desired.
 */
export function generateRandomStartedStatus(): savedGameStatus {
  /** Skip the first index by starting from 1. */
  const minIndex = 1;
  /** Allow selecting up to the last index. */
  const maxIndex = SAVED_GAME_STATUSES.length - 1;

  const index = randomBetween(minIndex, maxIndex);
  return SAVED_GAME_STATUSES[index];
}

/**
 * Returns a random order option from `ORDERS`.
 */
export function generateRandomOrder(): GameOrder {
  return ORDERS[randomNumber(ORDERS.length)];
}

/**
 * Returns a random dialog content key, excluding:
 * - 'error'
 * - 'message'
 * - undefined
 *
 * This helper is useful for tests that specifically need "action" dialogs.
 */
export function generateRandomDialogContent(): DialogContent {
  /** Start with an excluded value to enter the loop. */
  let content: DialogContent = 'error';

  // Keep picking until we hit an allowed content type.
  while (content === 'error' || content === 'message' || content === undefined) {
    content = DIALOG_CONTENT[randomNumber(DIALOG_CONTENT.length)];
  }

  return content;
}

/**
 * Generates a random hex color string in the form "#xxxxxx".
 *
 * Note:
 * - Digits are generated from 0-9 only (not full hex a-f),
 *   which is good enough for tests where any color-like string is acceptable.
 */
export function randomHexColor(): string {
  let result = '#';

  // Append 6 digits to form a color-like hex string.
  for (let i = 0; i < 6; i++) {
    result += String(randomNumber(10));
  }

  return result;
}

/**
 * Generates a random `GameSettings` object for tests.
 *
 * - hardness: 1..4
 * - opponent: 'player' | 'computer'
 * - size: 1..9
 */
export function generateRandomGameSettingObject(): GameSettings {
  /** Possible opponent types. */
  const opponents = ['player', 'computer'];

  return {
    hardness: randomBetween(1, 4),
    opponent: opponents[randomNumber(opponents.length)] as 'player' | 'computer',
    size: randomBetween(1, 9),
  };
}
