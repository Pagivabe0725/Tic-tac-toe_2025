import { DIALOG_BUTTON_TYPES } from '../constants/dialog-button.constant';

/**
 * Represents the allowed button action types for dialogs.
 *
 * This type is derived from `DIALOG_BUTTON_TYPES`, producing a strict
 * union type of its literal values:
 *
 * `"trigger" | "accept" | "reject"`.
 *
 * - "trigger": Invokes a listener function without closing the dialog.
 * - "accept": Closes the dialog immediately with a `true` result.
 * - "reject": Closes the dialog immediately with a `false` result.
 */
export type DialogButton = (typeof DIALOG_BUTTON_TYPES)[number];
