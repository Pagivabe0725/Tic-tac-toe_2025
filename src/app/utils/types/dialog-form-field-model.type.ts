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
 * Defines the structure of a single form field in a dialog.
 * 
 * @property field - Unique identifier of the field in the UI.
 * @property title - Human-readable label displayed in the form.
 * @property type - The type of input element (text, select, email, etc.).
 * @property model - Corresponding FormFieldModel used for data binding.
 * @property options - Optional array of selectable values for 'select' type fields.
 * @property min - Optional minimum value for 'range' type fields.
 * @property max - Optional maximum value for 'range' type fields.
 * @property errorKeys - Optional list of validation error keys to check for this field.
 * Each key must correspond to a method in the Form service
 * (e.g., 'invalidEmail' → markAsInvalidEmail).
 */
export interface FormField {
  field: string;
  title: string;
  type: 'select' | 'text' | 'email' | 'range' | 'color' | 'password';
  model: FormFieldModel;
  options?: string[] | number[];
  baseValue?:string | number;
  min?: number;
  max?: number;
  errorKeys?: ErrorKeys[];
  valueType: 'string' | 'number'
}

/**
 * Represents the valid keys for dialog form sections.
 * Excludes undefined to ensure type safety when accessing FORM_FIELDS_MAP.
 */
export type FieldKey = NonNullable<DialogContent>;
