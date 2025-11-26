import { DIALOG_CONTENT } from "./dialog-content.constant";

/**
 * Success messages for snackbar display.
 * Keys correspond to DIALOG_CONTENT identifiers (excluding 'error' and 'message').
 */
export const SNACKBAR_SUCCESS_MESSAGES = new Map<typeof DIALOG_CONTENT[number], string>([
  ['game_setting', 'Game settings saved'],
  ['save', 'Saved successfully'],
  ['setting', 'Settings updated'],
  ['login', 'Logged in successfully'],
  ['registration', 'Registration successful'],
  // 'message' and 'error' are intentionally omitted
]);

/**
 * Failed messages for snackbar display.
 * Keys correspond to DIALOG_CONTENT identifiers (excluding 'error' and 'message').
 */
export const SNACKBAR_FAILED_MESSAGES = new Map<typeof DIALOG_CONTENT[number], string>([
  ['game_setting', 'Game settings failed'],
  ['save', 'Save failed'],
  ['setting', 'Settings update failed'],
  ['login', 'Login failed'],
  ['registration', 'Registration failed'],
  // 'message' and 'error' are intentionally omitted
]);