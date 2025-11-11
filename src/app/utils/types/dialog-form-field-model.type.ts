import { DialogForm } from "../../components/dialog/dialog-form/dialog-form";
import { DialogContent } from "./dialog-content.type";
import { ErrorKeys } from "./error-messages.type";




/**
 * Represents all possible model identifiers for dialog form fields.
 * These are used to map the form input to its corresponding data property.
 */
export type FormFieldModel =
  | 'hardness'
  | 'primaryColor'
  | 'accentColor'
  | 'gameName'
  | 'email'
  | 'password'
  | 'rePassword'
  | 'opponent'
  | 'size';



/**
 * Represents the valid keys for dialog form sections.
 * Excludes undefined to ensure type safety when accessing FORM_FIELDS_MAP.
 */
export type FieldKey = NonNullable<DialogContent>;
