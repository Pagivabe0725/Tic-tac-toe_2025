/**
 * Maps grid sizes to their corresponding icon and cover font sizes.
 * Used to dynamically scale cell content based on the game field size.
 */
export const sizeMap = new Map<number, { icon: string; cover: string }>([
  [3, { icon: '10vw', cover: '8vw' }],
  [4, { icon: '8vw', cover: '6vw' }],
  [5, { icon: '6.5vw', cover: '4.5vw' }],
  [6, { icon: '4.5vw', cover: '2.5vw' }],
  [7, { icon: '3.5vw', cover: '2.5vw' }],
  [8, { icon: '3vw', cover: '2vw' }],
  [9, { icon: '2vw', cover: '1.5vw' }],
]);