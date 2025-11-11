/**
 * Prefix applied to every sessionStorage key used by the game logic.
 * Creates a clean, isolated namespace (`game_*`) that:
 *  - prevents key collisions with other sessionStorage entries,
 *  - makes it trivial to fetch stored game values by filtering for this prefix,
 *  - simplifies cleanup or migration by removing all `game_` entries in one sweep.
 */
export const STORAGE_PREFIX = 'game_';
