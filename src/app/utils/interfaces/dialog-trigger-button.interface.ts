/**
 * Interface representing a button that triggers opening a dialog.
 */
export interface DialogTriggerButton {
  /** ARIA label for accessibility, describing the dialog-trigger action */
  ariaLabel: string;

  /** Path or URL to the icon displayed on the trigger button */
  iconPath: string;

  /** Callback function executed to trigger the dialog */
  action: () => void;

  /** Condition determining whether the trigger button is active/visible */
  condition: boolean;
}
