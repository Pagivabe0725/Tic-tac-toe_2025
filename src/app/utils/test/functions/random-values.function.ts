import { DIALOG_CONTENT } from '../../constants/dialog-content.constant';
import { ORDERS } from '../../constants/order.constant';
import { SAVED_GAME_STATUSES } from '../../constants/saved-game-status.constant';
import { GameSettings } from '../../interfaces/game-settings.interface';
import { DialogContent } from '../../types/dialog-content.type';
import { savedGameStatus } from '../../types/game-status.type';
import { GameOrder } from '../../types/order.type';

export function randomNumber(length: number): number {
  return Math.floor(Math.random() * length);
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomStatus(): savedGameStatus {
  return SAVED_GAME_STATUSES[
    randomNumber(randomNumber(SAVED_GAME_STATUSES.length))
  ];
}

export function generateRandomStartedStatus(): savedGameStatus {
  const minIndex = 1;
  const maxIndex = SAVED_GAME_STATUSES.length - 1;

  const index = randomBetween(minIndex, maxIndex);
  return SAVED_GAME_STATUSES[index];
}

export function generateRandomOrder(): GameOrder {
  return ORDERS[randomNumber(ORDERS.length)];
}

export function generateRandomDialogContent(): DialogContent {
  let content: DialogContent = 'error';

  while (
    content === 'error' ||
    content === 'message' ||
    content === undefined
  ) {
    content = DIALOG_CONTENT[randomNumber(DIALOG_CONTENT.length)];
  }

  return content;
}

export function randomHexColor(): string {
  let result = '#';

  for (let i = 0; i < 6; i++) {
    result += String(randomNumber(10));
  }

  return result;
}

export function generateRandomGameSettingObject(): GameSettings {
  const opponents = ['player', 'computer'];

  return {
    hardness: randomBetween(1,4),
    opponent: opponents[randomNumber(opponents.length)] as
      | 'player'
      | 'computer',
    size: randomBetween(1, 9),
  };
}
