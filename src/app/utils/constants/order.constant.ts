/**
 * Defines the available ordering (sorting) modes for listing saved games.
 *
 * Values:
 * - 'alpha-asc'  → Alphabetical order (A → Z)
 * - 'alpha-desc' → Reverse alphabetical order (Z → A)
 * - 'time-asc'   → Chronological order (oldest → newest)
 * - 'time-desc'  → Reverse chronological order (newest → oldest)
 */
export const ORDERS = [
  'alpha-asc',
  'alpha-desc',
  'time-asc',
  'time-desc',
] as const;
