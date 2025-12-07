/**
 * Defines all dialog button behavior types.
 *
 * - "trigger": Executes the function that is waiting for this event, 
 *              without closing the dialog.
 * - "accept": Immediately closes the dialog with a `true` result value.
 * - "reject": Immediately closes the dialog with a `false` result value.
 *
 * Declared with `as const` to preserve literal string types.
 */
export const DIALOG_BUTTON_TYPES = ['trigger', 'accept', 'reject'] as const;
