import { DialogButton } from '../types/dialog-button.type';

/** 
 * Interface representing the structure of a dialog.
 * Includes its title, content, and optional buttons.
 */
export interface DialogStructure {
  /** Title of the dialog displayed at the top */
  title: string;

  /** Main content/body of the dialog */
  content: string;

  /** Optional array of buttons for user actions in the dialog */
  buttons?: {
    /** Type of the button, e.g., accept, reject, trigger */
    button: DialogButton;

    /** Display name/text of the button */
    name: string;

    /** Optional value to emit when this button is triggered */
    triggerValue?: string;
  }[];
}
