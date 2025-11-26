/**
 * @interface GameSettings
 * Represents the configuration used to initialize a new game.
 *
 * @property {number} size
 *    The dimension of the game board (e.g., 3 → 3x3, 5 → 5x5).
 *
 * @property {'player' | 'computer'} opponent
 *    Defines who the opponent is:
 *      - 'player'   → local two-player mode
 *      - 'computer' → AI-controlled opponent
 *
 * @property {number} hardness
 *    The AI difficulty level. Higher values correspond to stronger AI behavior.
 */
export interface GameSettings {

  /** @property size – The board dimension (e.g., 3 = 3x3). */
  size: number;

  /** @property opponent – Specifies whether the opponent is a human or an AI. */
  opponent: 'player' | 'computer';

  /** @property hardness – Numeric difficulty level controlling the AI strength. */
  hardness: number;
}
