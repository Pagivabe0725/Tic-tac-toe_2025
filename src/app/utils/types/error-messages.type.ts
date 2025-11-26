import { ERROR_MESSAGES } from "../interfaces/error-message.interface";

/**
 * Represents the valid error keys (e.g., "required", "invalidEmail").
 *
 * Extracts the key type from the ERROR_MESSAGES Map definition.
 */
export type ErrorKeys = typeof ERROR_MESSAGES extends Map<infer K, any>
  ? K
  : never;

/**
 * Represents the valid error message values (e.g., "This field is required.").
 *
 * Extracts the value type from the ERROR_MESSAGES Map definition.
 */
export type ErrorValues = typeof ERROR_MESSAGES extends Map<any, infer K>
  ? K
  : never;