
import { ORDERS } from '../../constants/order.constant';
import { SAVED_GAME_STATUSES } from '../../constants/saved-game-status.constant';
import { savedGameStatus } from '../../types/game-status.type';
import { GameOrder } from '../../types/order.type';

export function randomNumber(length:number):number{
    return Math.floor(Math.random() * length)
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

export function generateRandomOrder():GameOrder{

  return ORDERS[randomNumber(ORDERS.length)]
}


