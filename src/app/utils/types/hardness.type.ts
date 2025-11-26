import { HARNESS_VALUES } from '../constants/hardness.constant';

/**
 * @typedef Hardness
 *
 * Represents the difficulty level of the game.
 * Its value is constrained to the entries defined in `HARNESS_VALUES`.
 *
 * Example values: 'very-easy', 'easy', 'medium', 'hard' (depending on the constant array)
 */
export type Hardness = (typeof HARNESS_VALUES)[number];
