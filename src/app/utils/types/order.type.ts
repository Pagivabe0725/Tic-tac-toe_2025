import { ORDERS } from '../constants/order.constant';

/**
 * Represents the valid ordering options for listing saved games.
 *
 * This type is dynamically derived from `ORDERS`, so it always stays
 * in sync with the constant array.
 *
 * Equivalent to a union of:
 * 'alpha-asc' | 'alpha-desc' | 'time-asc' | 'time-desc'
 */
export type order = (typeof ORDERS)[number];
